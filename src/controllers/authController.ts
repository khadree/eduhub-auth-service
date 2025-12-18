import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import { authService } from '../services/authService';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/authenticate';

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: 'student' | 'teacher' | 'admin';
  };

  if (!email || !password) {
    throw new createHttpError.BadRequest('Email and password are required');
  }

  const tokens = await authService.register(email, password, role);
  res.status(201).json(tokens);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new createHttpError.BadRequest('Email and password are required');
  }

  const tokens = await authService.login(email, password);
  res.json(tokens);
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    throw new createHttpError.BadRequest('Refresh token is required');
  }

  const tokens = await authService.refresh(refreshToken);
  res.json(tokens);
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    throw new createHttpError.BadRequest('Refresh token is required');
  }

  await authService.logout(refreshToken);
  res.status(204).send();
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    throw new createHttpError.BadRequest('Email is required');
  }

  await authService.requestPasswordReset(email);
  res.json({ message: 'If the email exists, a reset link has been sent.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    throw new createHttpError.BadRequest('Token and new password are required');
  }

  await authService.resetPassword(token, password);
  res.json({ message: 'Password updated successfully' });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new createHttpError.Unauthorized('Unauthorized');
  }

  res.json({
    id: req.user.id,
    role: req.user.role,
    email: req.user.email,
  });
};

export const initiateSso = async (req: Request, res: Response) => {
  const { provider } = req.params;

  if (env.sso.allowedProviders.length > 0 && !env.sso.allowedProviders.includes(provider)) {
    throw new createHttpError.NotFound('SSO provider not enabled');
  }

  res.status(501).json({
    message: 'SSO integration is not implemented yet.',
    provider,
    nextSteps:
      'Implement OAuth2/OIDC flow for the provider and exchange code for tokens to integrate with EduHub.',
  });
};

export const ssoCallback = async (req: Request, res: Response) => {
  const { provider } = req.params;

  if (env.sso.allowedProviders.length > 0 && !env.sso.allowedProviders.includes(provider)) {
    throw new createHttpError.NotFound('SSO provider not enabled');
  }

  res.status(501).json({
    message: 'SSO callback placeholder. Implement token exchange and user provisioning.',
  });
};
