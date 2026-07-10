import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { validateQuery } from '../../../shared/http/validate-query.js';
import { GeocodingService } from './geocode.service.js';
import { GeocodingController } from './geocode.controller.js';
import { searchQuerySchema, reverseQuerySchema } from './geocode.schemas.js';

/**
 * Mounts the geocoding proxy's routes onto the shared GeocodingService (built
 * once in the geo module so its throttle and cache are process-wide). Public by
 * design — the address search and click-to-address probe must work signed-out —
 * so no `authenticate` middleware. Mounted at `/api/geo/geocode`.
 */
export function buildGeocodeModule(service: GeocodingService): Router {
  const controller = new GeocodingController(service);

  const router = Router();
  router.get('/search', validateQuery(searchQuerySchema), asyncHandler(controller.search));
  router.get('/reverse', validateQuery(reverseQuerySchema), asyncHandler(controller.reverse));

  return router;
}
