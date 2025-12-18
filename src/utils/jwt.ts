import jwt from 'jsonwebtoken';

import { env } from '../config/env';

interface AccessTokenPayload {
  sub: string;
  role: string;
  email: string;
  type: 'access';
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export const signAccessToken = (userId: string, role: string, email: string) =>
  jwt.sign({ sub: userId, role, email, type: 'access' } satisfies AccessTokenPayload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });

export const signRefreshToken = (userId: string, jti: string) =>
  jwt.sign({ sub: userId, jti, type: 'refresh' } satisfies RefreshTokenPayload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload & jwt.JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload & jwt.JwtPayload;
