import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/AppError';
import { createQuotationSchema, updateQuotationSchema } from '../schemas/quotation.schema';
import { fireApprovalWebhook } from '../services/n8n.service';
import { buildQuotationHtml } from '../services/quotation-html.service';
import { parseQuotationLang } from '../lib/quotation-i18n';
import { htmlToPdf } from '../services/quotation-pdf.service';
import { generateReviewToken } from '../lib/reviewToken';
import { env } from '../lib/env';
import { QuotationStatus } from '../generated/prisma/client';

export const listQuotations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? '20'), 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status as QuotationStatus;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
      }),
      prisma.quotation.count({ where }),
    ]);

    res.json({
      data: quotations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const createQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = createQuotationSchema.parse(req.body);

    // A bad clientId triggers a foreign-key error (P2003) which the error handler maps to 404,
    // so we skip a separate existence query.
    const quotation = await prisma.quotation.create({
      data,
      include: { client: true, items: true },
    });

    res.status(201).json(quotation);
  } catch (err) {
    next(err);
  }
};

export const getQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
    if (!quotation) throw new AppError('Quotation not found', 404, 'NOT_FOUND');
    res.json(quotation);
  } catch (err) {
    next(err);
  }
};

export const updateQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const data = updateQuotationSchema.parse(req.body);

    // update throws P2025 if the row is missing → mapped to 404 by the error handler.
    const quotation = await prisma.quotation.update({
      where: { id },
      data,
      include: { client: true, items: true },
    });
    res.json(quotation);
  } catch (err) {
    next(err);
  }
};

export const deleteQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    await prisma.quotation.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const pdfFilename = (title: string) =>
  `${title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'quotation'}.pdf`;

export const getQuotationPdf = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
    if (!quotation) throw new AppError('Quotation not found', 404, 'NOT_FOUND');

    const lang = parseQuotationLang(req.query.lang);
    const html = buildQuotationHtml(quotation, lang);
    const pdf = await htmlToPdf(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename(quotation.title)}"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

export const getQuotationPreview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
    if (!quotation) throw new AppError('Quotation not found', 404, 'NOT_FOUND');

    const lang = parseQuotationLang(req.query.lang);
    res.json({
      quotation,
      html: buildQuotationHtml(quotation, lang),
      lang,
    });
  } catch (err) {
    next(err);
  }
};

export const sendQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
    if (!quotation) throw new AppError('Quotation not found', 404, 'NOT_FOUND');
    if (quotation.status !== 'DRAFT') {
      throw new AppError('Only draft quotations can be sent', 409, 'INVALID_STATUS');
    }
    if (!quotation.items.length) {
      throw new AppError('Add at least one item before sending', 400, 'NO_ITEMS');
    }

    const reviewToken = quotation.reviewToken ?? generateReviewToken();
    const reviewUrl = `${env.FRONTEND_URL}/review/${reviewToken}`;

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'SENT',
        reviewToken,
        sentAt: new Date(),
      },
      include: { client: true, items: true },
    });

    res.json({
      success: true,
      quotation: updated,
      reviewUrl,
      message: 'Quotation marked as sent — share the review link with your client',
    });
  } catch (err) {
    next(err);
  }
};

export const approveQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params['id'] as string;

    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { client: true, items: true },
    });

    void fireApprovalWebhook(quotation.id, {
      title: quotation.title,
      totalAmount: quotation.totalAmount,
      clientEmail: (quotation.client as { email: string }).email,
      clientName: (quotation.client as { name: string }).name,
    });

    res.json({ success: true, quotation });
  } catch (err) {
    next(err);
  }
};
