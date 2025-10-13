import http from 'http';

import { createApp } from './app';
import { env } from './config/env';
import { pool } from './config/database';
import { sessionService } from './services/sessionService';

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    await sessionService.connect();

    const app = createApp();
    const server = http.createServer(app);

    server.listen(env.port, () => {
      console.log(`Auth service running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

void startServer();
