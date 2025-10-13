import 'express-async-errors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { authRoutes } from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRoutes);

  app.use(errorHandler);

  return app;
};
