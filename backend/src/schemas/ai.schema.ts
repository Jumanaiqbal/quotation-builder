import { z } from 'zod';

export const aiResponseSchema = z.object({
  project_type: z.string(),
  suggested_items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      quantity: z.number().int().positive(),
      unit_price: z.number().nullable(),
      estimated_hours: z.number().int().positive(),
    }),
  ),
  questions_to_ask_client: z.array(z.string()),
  summary: z.string(),
});

export type AiResponse = z.infer<typeof aiResponseSchema>;
