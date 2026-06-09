import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Must be a valid email address'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
