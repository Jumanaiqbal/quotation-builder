import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

declare global {
  
  var prisma: PrismaClient | undefined;
}

const createClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

export const prisma: PrismaClient = global.prisma ?? createClient();

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
