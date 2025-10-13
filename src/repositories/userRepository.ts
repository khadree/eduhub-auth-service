import { QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';

import { query } from '../config/database';
import { User, UserRole } from '../types/user';

const mapRowToUser = (row: Record<string, unknown>): User => ({
  id: row.id as string,
  email: row.email as string,
  passwordHash: row.password_hash as string,
  role: row.role as UserRole,
  isEmailVerified: row.is_email_verified as boolean,
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
  lastLoginAt: row.last_login_at ? new Date(row.last_login_at as string) : null,
  resetToken: (row.reset_token as string) || null,
  resetTokenExpiresAt: row.reset_token_expires_at
    ? new Date(row.reset_token_expires_at as string)
    : null,
});

export const userRepository = {
  async createUser(email: string, passwordHash: string, role: UserRole): Promise<User> {
    const id = uuid();
    const result: QueryResult = await query(
      `
        INSERT INTO users (id, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [id, email.toLowerCase(), passwordHash, role],
    );

    return mapRowToUser(result.rows[0]);
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
      email.toLowerCase(),
    ]);
    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToUser(result.rows[0]);
  },

  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToUser(result.rows[0]);
  },

  async saveRefreshToken(userId: string, refreshTokenId: string, expiresAt: Date) {
    await query(
      `
        INSERT INTO refresh_tokens (id, user_id, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET expires_at = $3, updated_at = NOW()
      `,
      [refreshTokenId, userId, expiresAt.toISOString()],
    );
  },

  async deleteRefreshToken(refreshTokenId: string) {
    await query('DELETE FROM refresh_tokens WHERE id = $1', [refreshTokenId]);
  },

  async revokeUserRefreshTokens(userId: string) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  },

  async findRefreshToken(refreshTokenId: string) {
    const result = await query('SELECT * FROM refresh_tokens WHERE id = $1 LIMIT 1', [
      refreshTokenId,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const expiresAt = new Date(row.expires_at as string);

    if (expiresAt.getTime() < Date.now()) {
      await userRepository.deleteRefreshToken(refreshTokenId);
      return null;
    }

    return row;
  },

  async updateLastLogin(userId: string) {
    await query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [
      userId,
    ]);
  },

  async setPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    await query(
      `
        UPDATE users
        SET reset_token = $2, reset_token_expires_at = $3, updated_at = NOW()
        WHERE id = $1
      `,
      [userId, token, expiresAt.toISOString()],
    );
  },

  async findByResetToken(token: string): Promise<{ user: User; expiresAt: Date } | null> {
    const result = await query('SELECT * FROM users WHERE reset_token = $1 LIMIT 1', [token]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = mapRowToUser(result.rows[0]);

    if (!user.resetTokenExpiresAt) {
      return null;
    }

    return { user, expiresAt: user.resetTokenExpiresAt };
  },

  async clearPasswordResetToken(userId: string) {
    await query(
      `
        UPDATE users
        SET reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW()
        WHERE id = $1
      `,
      [userId],
    );
  },

  async updatePassword(userId: string, passwordHash: string) {
    await query(
      `
        UPDATE users
        SET password_hash = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [userId, passwordHash],
    );
  },
};
