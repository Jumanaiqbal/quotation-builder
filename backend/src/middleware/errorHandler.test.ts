import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { errorHandler } from './errorHandler';
import { AppError } from '../lib/AppError';

const mockRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
};

const req = {} as Request;
const next = vi.fn() as unknown as NextFunction;

describe('errorHandler', () => {
  let res: Response;

  beforeEach(() => {
    res = mockRes();
  });

  it('maps ZodError to 400 with field-level details', () => {
    let zodError: ZodError;
    try {
      z.object({ email: z.string().email() }).parse({ email: 'bad' });
      throw new Error('expected zod to throw');
    } catch (err) {
      zodError = err as ZodError;
    }

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: 'VALIDATION_ERROR',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ]),
      }),
    );
  });

  it('maps AppError to its own status code and code', () => {
    errorHandler(new AppError('Quotation not found', 404, 'NOT_FOUND'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: 'NOT_FOUND',
      message: 'Quotation not found',
    });
  });

  it('maps Prisma P2025 (record not found) to 404', () => {
    errorHandler({ code: 'P2025' }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps Prisma P2003 (foreign key violation) to 404', () => {
    errorHandler({ code: 'P2003' }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps Prisma P2002 (unique constraint) to 409 conflict', () => {
    errorHandler({ code: 'P2002' }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'CONFLICT' }),
    );
  });

  it('falls back to 500 for unknown errors without leaking details', () => {
    errorHandler(new Error('db connection string leaked!'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  });

  it('handles non-Error throwables (strings, null)', () => {
    errorHandler('boom', req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);

    res = mockRes();
    errorHandler(null, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
