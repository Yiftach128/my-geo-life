import { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ITokenService } from '../security/token.service.js';
import type { IUserRepository } from '../../modules/user/repository/user.repository.interface.js';
import { UnauthorizedError } from '../errors/index.js';

/**
 * Builds the `protect` middleware. Depends only on abstractions
 * (ITokenService, IUserRepository), so it is wired with concrete instances in
 * the composition root. On success it attaches the domain `User` to `req.user`.
 */
export const createAuthenticate =
  (tokenService: ITokenService, userRepository: IUserRepository): RequestHandler =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = header.slice('Bearer '.length);

      let payload;
      try {
        payload = await tokenService.verify(token);
      } catch {
        throw new UnauthorizedError('Invalid or expired token');
      }

      const user = await userRepository.findById(payload.id);
      if (!user) {
        throw new UnauthorizedError('User no longer exists');
      }
      if (user.tokenVersion !== payload.version) {
        throw new UnauthorizedError('Token invalidated — please log in again');
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
