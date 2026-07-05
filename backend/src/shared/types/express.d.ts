import type { User } from '../../modules/user/domain/user.entity.js';

declare global {
  namespace Express {
    interface Request {
      // Domain user attached by the authenticate middleware.
      user?: User;
      // Validated DTO attached by the validateBody middleware. Controllers cast
      // it to the concrete DTO type for the route.
      dto?: unknown;
    }
  }
}

export {};
