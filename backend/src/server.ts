import 'dotenv/config';
import app from './app';
import { env } from './lib/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(env.PORT, () => {
      logger.info('Server running', { port: env.PORT, env: env.NODE_ENV });
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

void start();
