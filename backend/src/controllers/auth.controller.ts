import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { comparePassword } from '../lib/password';
import { AppError } from '../lib/AppError';
import { loginSchema } from '../schemas/auth.schema';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await comparePassword(password, user.passwordHash);

    if (!valid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = signToken({ id: user.id, email: user.email });

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
};
