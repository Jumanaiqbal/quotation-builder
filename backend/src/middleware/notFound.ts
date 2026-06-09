import { Request, Response } from 'express';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'The requested resource does not exist',
  });
};
