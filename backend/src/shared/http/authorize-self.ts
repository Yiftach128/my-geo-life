import { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/index.js';

/**
 * Route-layer guard for the `/:id` user endpoints. Runs after `authenticate`,
 * so `req.user` is normally set. Rejects any request whose `:id` path param
 * doesn't match the authenticated user's own id with a 403. The check happens
 * before the DB is touched, so a foreign id 403s uniformly whether or not it
 * exists.
 */
export const authorizeSelf: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (req.params.id !== req.user.id) {
    return next(new ForbiddenError('You can only access your own account'));
  }
  next();
};
