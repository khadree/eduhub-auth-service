import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (createHttpError.isHttpError(error)) {
    const httpError = error as createHttpError.HttpError;
    res.status(httpError.statusCode).json({
      message: httpError.message,
      statusCode: httpError.statusCode,
    });
    return;
  }

  console.error('Unexpected error', error);
  res.status(500).json({ message: 'Internal Server Error', statusCode: 500 });
};
