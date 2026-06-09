import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { AppError } from '../lib/AppError';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
};
