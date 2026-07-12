import { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/index.js';

/**
 * Route-layer guard restricting an endpoint to admin users. Runs after
 * `authenticate`; `req.user.role` is read live from the DB on every request
 * (see the authenticate middleware), so promoting a user takes effect
 * immediately with no re-login.
 */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};
