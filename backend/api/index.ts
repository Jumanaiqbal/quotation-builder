import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

// Wrap Express so Vercel's Node runtime forwards every path correctly
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
