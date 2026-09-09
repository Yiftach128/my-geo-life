import express, { Application, Request, Response } from 'express';
import { config } from './shared/config/env.js';
import { PasswordHasher } from './shared/security/password-hasher.js';
import { TokenService } from './shared/security/token.service.js';
import { errorHandler } from './shared/http/error-handler.js';
import { staticFrontend } from './shared/http/static-frontend.js';
import { buildUserModule } from './modules/user/user.module.js';
import { buildAuthModule } from './modules/auth/auth.module.js';
import { buildGeoModule } from './modules/geo/geo.module.js';

/**
 * Composition root. Instantiates the shared singletons, wires the feature
 * modules (passing the user repository into auth — the one cross-module link),
 * mounts their routers, and registers the central error handler last. Performs
 * no I/O, so it is safe to call from tests.
 */
export function buildApp(): Application {
  const app = express();
  app.use(express.json());

  const passwordHasher = new PasswordHasher();
  const tokenService = new TokenService({
    jwtSecret: config.jwtSecret,
    jwtExpiresIn: config.jwtExpiresIn,
  });

  const userModule = buildUserModule({ passwordHasher, tokenService });
  const authModule = buildAuthModule({
    userRepository: userModule.userRepository,
    passwordHasher,
    tokenService,
  });
  const geoModule = buildGeoModule({
    tokenService,
    userRepository: userModule.userRepository,
  });

  app.use('/api/users', userModule.router);
  app.use('/auth', authModule.router);
  app.use('/api/geo', geoModule);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Production image only: serve the built React app from the same origin.
  if (config.staticDir) {
    app.use(staticFrontend(config.staticDir));
  }

  app.use(errorHandler);

  return app;
}
