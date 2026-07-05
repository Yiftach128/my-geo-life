import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * **Wraps** an async route handler so any rejected promise is forwarded to the
 * central error handler. Lets controllers drop their try/catch boilerplate.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
