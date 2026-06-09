import { z } from 'zod';

export const createQuotationSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
});

export const updateQuotationSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED']).optional(),
  notes: z.string().optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
