import createHttpError from 'http-errors';
import { v4 as uuid } from 'uuid';

import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';
import { User, UserRole } from '../types/user';
import { sendPasswordResetEmail } from '../email/mailer';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateSecureToken } from '../utils/token';
import { sessionService } from './sessionService';
import { parseDurationToSeconds } from '../utils/time';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  expiresIn: string;
}

const DEFAULT_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const REFRESH_TTL_SECONDS = parseDurationToSeconds(
  env.jwt.refreshExpiresIn,
  DEFAULT_REFRESH_TTL_SECONDS,
);
const ALLOWED_ROLES: UserRole[] = ['student', 'teacher', 'admin'];

const buildTokens = async (user: User): Promise<AuthTokens> => {
  const refreshTokenId = uuid();
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, refreshTokenId);

  await userRepository.saveRefreshToken(user.id, refreshTokenId, new Date(Date.now() + REFRESH_TTL_SECONDS * 1000));
  await sessionService.storeSession(refreshTokenId, { userId: user.id, refreshTokenId }, REFRESH_TTL_SECONDS);

  return {
    accessToken,
    refreshToken,
    refreshTokenId,
    expiresIn: env.jwt.accessExpiresIn,
  };
};

export const authService = {
  async register(email: string, password: string, role: UserRole = 'student') {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new createHttpError.BadRequest('Invalid role provided');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new createHttpError.Conflict('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.createUser(email, passwordHash, role);

    return buildTokens(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new createHttpError.Unauthorized('Invalid email or password');
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      throw new createHttpError.Unauthorized('Invalid email or password');
    }

    await userRepository.updateLastLogin(user.id);
    return buildTokens(user);
  },

  async refresh(refreshToken: string) {
    let payload: ReturnType<typeof verifyRefreshToken>;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new createHttpError.Unauthorized('Invalid refresh token');
    }

    const session = await sessionService.getSession(payload.jti);
    if (!session) {
      throw new createHttpError.Unauthorized('Refresh session expired');
    }

    const existingToken = await userRepository.findRefreshToken(payload.jti);
    if (!existingToken) {
      await sessionService.deleteSession(payload.jti);
      throw new createHttpError.Unauthorized('Refresh token revoked');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new createHttpError.Unauthorized('User not found');
    }

    await userRepository.deleteRefreshToken(payload.jti);
    await sessionService.deleteSession(payload.jti);

    return buildTokens(user);
  },

  async logout(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await userRepository.deleteRefreshToken(payload.jti);
      await sessionService.deleteSession(payload.jti);
    } catch (error) {
      throw new createHttpError.Unauthorized('Invalid refresh token');
    }
  },

  async revokeUserSessions(userId: string) {
    await userRepository.revokeUserRefreshTokens(userId);
  },

  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const token = generateSecureToken(20);
    const expiresAt = new Date(Date.now() + env.reset.expiresInMinutes * 60 * 1000);

    await userRepository.setPasswordResetToken(user.id, token, expiresAt);

    const resetUrl = `${env.appUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail({ email: user.email, resetToken: token, resetUrl });
  },

  async resetPassword(token: string, newPassword: string) {
    const result = await userRepository.findByResetToken(token);
    if (!result) {
      throw new createHttpError.BadRequest('Invalid or expired reset token');
    }

    const { user, expiresAt } = result;
    if (expiresAt.getTime() < Date.now()) {
      throw new createHttpError.BadRequest('Reset token expired');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, passwordHash);
    await userRepository.clearPasswordResetToken(user.id);
    await userRepository.revokeUserRefreshTokens(user.id);
  },
};
