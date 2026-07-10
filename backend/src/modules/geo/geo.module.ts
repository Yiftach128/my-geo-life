import { Router } from 'express';
import { ITokenService } from '../../shared/security/token.service.js';
import { IUserRepository } from '../user/repository/user.repository.interface.js';
import { createAuthenticate } from '../../shared/http/authenticate.js';
import { config } from '../../shared/config/env.js';
import { GeocodingService } from './geocode/geocode.service.js';
import { buildLandmarkModule } from './landmark/landmark.module.js';
import { buildCircleModule } from './circle/circle.module.js';
import { buildPolygonModule } from './polygon/polygon.module.js';
import { buildGeocodeModule } from './geocode/geocode.module.js';

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

  // One shared geocoder: its <=1/sec throttle and response cache must be
  // process-wide, so the geo services (which reverse-geocode on create) and the
  // public geocode routes all resolve through the same instance.
  const geocoder = new GeocodingService({
    baseUrl: config.geocoderBaseUrl,
    userAgent: config.geocoderUserAgent,
    language: config.geocoderLanguage,
  });

  const router = Router();
  router.use('/landmarks', buildLandmarkModule({ authenticate, geocoder }));
  router.use('/circles', buildCircleModule({ authenticate, geocoder }));
  router.use('/polygons', buildPolygonModule({ authenticate, geocoder }));
  router.use('/geocode', buildGeocodeModule(geocoder)); // public: search/probe work signed-out

  return router;
}
