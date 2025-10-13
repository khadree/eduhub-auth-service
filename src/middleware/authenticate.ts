import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (requiredRoles?: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new createHttpError.Unauthorized('Authorization header missing'));
    }

    const token = header.split(' ')[1];

    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };

      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
        return next(new createHttpError.Forbidden('Insufficient permissions'));
      }

      return next();
    } catch (error) {
      return next(new createHttpError.Unauthorized('Invalid or expired token'));
    }
  };
