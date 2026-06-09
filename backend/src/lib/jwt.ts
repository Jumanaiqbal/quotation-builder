import jwt from 'jsonwebtoken';
import { env } from './env';
import { AppError } from './AppError';

export interface JwtPayload {
  id: string;
  email: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};
