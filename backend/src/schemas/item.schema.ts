import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().min(0).default(0),
  estimatedHours: z.number().int().positive().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
