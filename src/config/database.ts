import { Pool } from 'pg';

import { env } from './env';

export const pool = new Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  user: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.database,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL client error', error);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
