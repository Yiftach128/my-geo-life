import { Router } from 'express';
import { ITokenService } from '../../shared/security/token.service.js';
import { IUserRepository } from '../user/repository/user.repository.interface.js';
import { createAuthenticate } from '../../shared/http/authenticate.js';
import { buildLandmarkModule } from './landmark/landmark.module.js';
import { buildCircleModule } from './circle/circle.module.js';
import { buildPolygonModule } from './polygon/polygon.module.js';

export interface GeoModuleDeps {
  tokenService: ITokenService;
  userRepository: IUserRepository;
}

/**
 * Aggregates the three geo feature routers under one router. Builds the shared
 * `authenticate` middleware once (from the token service + user repository) and
 * hands it to each sub-module. Mounted at `/api/geo` by the composition root.
 */
export function buildGeoModule(deps: GeoModuleDeps): Router {
  const authenticate = createAuthenticate(deps.tokenService, deps.userRepository);

  const router = Router();
  router.use('/landmarks', buildLandmarkModule({ authenticate }));
  router.use('/circles', buildCircleModule({ authenticate }));
  router.use('/polygons', buildPolygonModule({ authenticate }));

  return router;
}
