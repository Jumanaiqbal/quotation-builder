import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/AppError';
import { buildQuotationHtml } from '../services/quotation-html.service';
import { fireApprovalWebhook } from '../services/n8n.service';
import { parseQuotationLang } from '../lib/quotation-i18n';

const findByToken = async (token: string) => {
  const quotation = await prisma.quotation.findUnique({
    where: { reviewToken: token },
    include: { client: true, items: true },
  });
  if (!quotation) throw new AppError('Quotation not found or link expired', 404, 'NOT_FOUND');
  return quotation;
};

export const getQuotationByReviewToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.params['token'] as string;
    const quotation = await findByToken(token);
    const lang = parseQuotationLang(req.query.lang);
    res.json({
      id: quotation.id,
      title: quotation.title,
      status: quotation.status,
      totalAmount: quotation.totalAmount,
      notes: quotation.notes,
      createdAt: quotation.createdAt,
      sentAt: quotation.sentAt,
      client: quotation.client,
      items: quotation.items,
      html: buildQuotationHtml(quotation, lang),
      lang,
    });
  } catch (err) {
    next(err);
  }
};

export const approveByReviewToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.params['token'] as string;
    const existing = await findByToken(token);

    if (existing.status === 'APPROVED') {
      res.json({ success: true, status: 'APPROVED', message: 'Already approved' });
      return;
    }
    if (existing.status === 'REJECTED') {
      throw new AppError('This quotation was already rejected', 409, 'ALREADY_REJECTED');
    }
    if (existing.status !== 'SENT') {
      throw new AppError('This quotation is not awaiting approval', 409, 'INVALID_STATUS');
    }

    const quotation = await prisma.quotation.update({
      where: { id: existing.id },
      data: { status: 'APPROVED' },
      include: { client: true, items: true },
    });

    void fireApprovalWebhook(quotation.id, {
      source: 'client_review_link',
      title: quotation.title,
      totalAmount: quotation.totalAmount,
      clientEmail: quotation.client.email,
      clientName: quotation.client.name,
    });

    res.json({ success: true, status: 'APPROVED', quotation });
  } catch (err) {
    next(err);
  }
};

export const rejectByReviewToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.params['token'] as string;
    const existing = await findByToken(token);

    if (existing.status === 'REJECTED') {
      res.json({ success: true, status: 'REJECTED', message: 'Already rejected' });
      return;
    }
    if (existing.status === 'APPROVED') {
      throw new AppError('This quotation was already approved', 409, 'ALREADY_APPROVED');
    }
    if (existing.status !== 'SENT') {
      throw new AppError('This quotation is not awaiting a response', 409, 'INVALID_STATUS');
    }

    const quotation = await prisma.quotation.update({
      where: { id: existing.id },
      data: { status: 'REJECTED' },
      include: { client: true, items: true },
    });

    res.json({ success: true, status: 'REJECTED', quotation });
  } catch (err) {
    next(err);
  }
};
