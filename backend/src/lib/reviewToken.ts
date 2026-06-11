import { randomBytes } from 'crypto';

export const generateReviewToken = (): string => randomBytes(32).toString('hex');
