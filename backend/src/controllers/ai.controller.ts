import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateQuotationDraft } from '../services/ai.service';

const aiDraftRequestSchema = z.object({
  clientRequest: z.string().min(10, 'Client request must be at least 10 characters'),
});

export const getAiDraft = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { clientRequest } = aiDraftRequestSchema.parse(req.body);
    const draft = await generateQuotationDraft(clientRequest, req.user?.id);
    res.json(draft);
  } catch (err) {
    next(err);
  }
};
