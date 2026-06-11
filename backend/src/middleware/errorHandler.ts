import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Map common Prisma errors (duck-typed by code to avoid coupling to the generated client).
  // This lets controllers skip a "does it exist?" pre-query and act directly, halving DB round trips.
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    const code = (err as { code: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'The requested resource does not exist' });
      return;
    }
    if (code === 'P2003') {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'A referenced record does not exist' });
      return;
    }
    if (code === 'P2002') {
      res.status(409).json({ success: false, code: 'CONFLICT', message: 'A record with this value already exists' });
      return;
    }
  }

  logger.error('Unexpected error', err);

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
};
