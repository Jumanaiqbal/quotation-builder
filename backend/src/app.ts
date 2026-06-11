import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './lib/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticate } from './middleware/auth';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
import clientsRouter from './routes/clients.routes';
import quotationsRouter from './routes/quotations.routes';
import publicRouter from './routes/public.routes';

const app = express();

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Quotify API', health: '/api/health' });
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl with no Origin header
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      // Vercel preview/production frontends (e.g. quotation-builder-b2y1.vercel.app)
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(express.json());

app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

app.use('/api/public', publicRouter);
app.use('/api/clients', authenticate, clientsRouter);
app.use('/api/quotations', authenticate, quotationsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
