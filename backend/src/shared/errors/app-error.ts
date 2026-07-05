/**
 * Base class for all expected ("operational") errors. Each subclass owns the
 * HTTP status code it maps to, so controllers and services never hardcode
 * status numbers — the central errorHandler reads `statusCode` off the error.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}
