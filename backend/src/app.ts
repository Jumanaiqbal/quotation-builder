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

app.use(helmet());

app.use(cors({ origin: env.FRONTEND_URL }));

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
