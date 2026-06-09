import fs from 'fs';
import path from 'path';
import { callAI } from '../lib/anthropic';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { AppError } from '../lib/AppError';
import { aiResponseSchema, type AiResponse } from '../schemas/ai.schema';

export const generateQuotationDraft = async (
  clientRequest: string,
  userId?: string,
): Promise<AiResponse> => {
  
  const promptPath = path.join(__dirname, '..', '..', '..', 'prompts', 'quotation-draft.md');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  let rawResponse = '';

  try {
    rawResponse = await callAI(systemPrompt, clientRequest);
  } catch (err) {
    await prisma.aiLog.create({
      data: {
        userId: userId ?? null,
        clientRequest,
        rawResponse: '',
        parsedSuccessfully: false,
        errorMessage: err instanceof Error ? err.message : 'AI call failed',
      },
    });
    throw new AppError('AI service timed out or failed', 504, 'AI_ERROR');
  }

  const cleaned = rawResponse
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    await prisma.aiLog.create({
      data: {
        userId: userId ?? null,
        clientRequest,
        rawResponse,
        parsedSuccessfully: false,
        errorMessage: `JSON.parse failed: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
      },
    });
    logger.warn('AI returned non-JSON response', { rawResponse });
    throw new AppError('AI returned an unparseable response', 422, 'AI_PARSE_ERROR');
  }

  const result = aiResponseSchema.safeParse(parsed);

  if (!result.success) {
    await prisma.aiLog.create({
      data: {
        userId: userId ?? null,
        clientRequest,
        rawResponse,
        parsedSuccessfully: false,
        errorMessage: result.error.message,
      },
    });
    logger.warn('AI response failed schema validation', { errors: result.error.issues });
    throw new AppError('AI response did not match expected structure', 422, 'AI_SCHEMA_ERROR');
  }

  await prisma.aiLog.create({
    data: {
      userId: userId ?? null,
      clientRequest,
      rawResponse,
      parsedSuccessfully: true,
    },
  });

  return result.data;
};
