import { Request, Response, NextFunction } from 'express';
import { Decimal } from '@prisma/client-runtime-utils';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/AppError';
import { calculateItemTotal, calculateQuotationTotal } from '../lib/calculations';
import { createItemSchema, updateItemSchema } from '../schemas/item.schema';

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const quotationId = req.params['id'] as string;
    const data = createItemSchema.parse(req.body);

    // A bad quotationId triggers a foreign-key error (P2003 → 404) on create,
    // so we avoid a separate existence query.
    const unitPrice = new Decimal(data.unitPrice);
    const total = calculateItemTotal(data.quantity, unitPrice);

    const item = await prisma.$transaction(async (tx) => {
      const newItem = await tx.quotationItem.create({
        data: {
          quotationId,
          title: data.title,
          description: data.description ?? null,
          quantity: data.quantity,
          unitPrice,
          total,
          estimatedHours: data.estimatedHours ?? null,
        },
      });

      const allItems = await tx.quotationItem.findMany({ where: { quotationId } });
      const newTotal = calculateQuotationTotal(
        allItems.map((i) => ({ total: new Decimal(String(i.total)) })),
      );

      await tx.quotation.update({ where: { id: quotationId }, data: { totalAmount: newTotal } });

      return newItem;
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const quotationId = req.params['id'] as string;
    const itemId = req.params['itemId'] as string;
    const data = updateItemSchema.parse(req.body);

    const existing = await prisma.quotationItem.findFirst({
      where: { id: itemId, quotationId },
    });
    if (!existing) throw new AppError('Item not found', 404, 'NOT_FOUND');

    const newQty = data.quantity ?? existing.quantity;
    const newUnitPrice =
      data.unitPrice !== undefined
        ? new Decimal(data.unitPrice)
        : new Decimal(String(existing.unitPrice));
    const newTotal = calculateItemTotal(newQty, newUnitPrice);

    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.quotationItem.update({
        where: { id: itemId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          quantity: newQty,
          unitPrice: newUnitPrice,
          total: newTotal,
          ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours }),
        },
      });

      const allItems = await tx.quotationItem.findMany({ where: { quotationId } });
      const quotationTotal = calculateQuotationTotal(
        allItems.map((i) => ({ total: new Decimal(String(i.total)) })),
      );

      await tx.quotation.update({
        where: { id: quotationId },
        data: { totalAmount: quotationTotal },
      });

      return updated;
    });

    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const quotationId = req.params['id'] as string;
    const itemId = req.params['itemId'] as string;

    const existing = await prisma.quotationItem.findFirst({
      where: { id: itemId, quotationId },
    });
    if (!existing) throw new AppError('Item not found', 404, 'NOT_FOUND');

    await prisma.$transaction(async (tx) => {
      await tx.quotationItem.delete({ where: { id: itemId } });

      const allItems = await tx.quotationItem.findMany({ where: { quotationId } });
      const quotationTotal = calculateQuotationTotal(
        allItems.map((i) => ({ total: new Decimal(String(i.total)) })),
      );

      await tx.quotation.update({
        where: { id: quotationId },
        data: { totalAmount: quotationTotal },
      });
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
