import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/index.js';

/**
 * Central error handler. Maps domain errors to their HTTP status codes and
 * never leaks internal details for unexpected errors.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err instanceof Error ? err.stack : err);
  res.status(500).json({ error: 'Internal Server Error' });
};
