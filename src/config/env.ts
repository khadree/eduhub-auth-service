import dotenv from 'dotenv';

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  postgres: {
    host: required(process.env.POSTGRES_HOST, 'POSTGRES_HOST'),
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: required(process.env.POSTGRES_DB, 'POSTGRES_DB'),
    user: required(process.env.POSTGRES_USER, 'POSTGRES_USER'),
    password: required(process.env.POSTGRES_PASSWORD, 'POSTGRES_PASSWORD'),
  },
  redisUrl: required(process.env.REDIS_URL, 'REDIS_URL'),
  jwt: {
    accessSecret: required(process.env.JWT_ACCESS_TOKEN_SECRET, 'JWT_ACCESS_TOKEN_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshSecret: required(process.env.JWT_REFRESH_TOKEN_SECRET, 'JWT_REFRESH_TOKEN_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  reset: {
    expiresInMinutes: Number(process.env.RESET_TOKEN_EXPIRES_IN_MINUTES || 30),
  },
  email: {
    from: required(process.env.EMAIL_FROM, 'EMAIL_FROM'),
    smtpHost: required(process.env.SMTP_HOST, 'SMTP_HOST'),
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: required(process.env.SMTP_USER, 'SMTP_USER'),
    smtpPassword: required(process.env.SMTP_PASSWORD, 'SMTP_PASSWORD'),
  },
  sso: {
    allowedProviders: (process.env.SSO_ALLOWED_PROVIDERS || '')
      .split(',')
      .map((provider) => provider.trim())
      .filter(Boolean),
  },
};
