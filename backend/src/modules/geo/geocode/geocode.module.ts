import { Router } from 'express';
import { config } from '../../../shared/config/env.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { validateQuery } from '../../../shared/http/validate-query.js';
import { GeocodingService } from './geocode.service.js';
import { GeocodingController } from './geocode.controller.js';
import { searchQuerySchema, reverseQuerySchema } from './geocode.schemas.js';

/**
 * Self-wires the geocoding proxy (service ← config → controller) and returns its
 * router. Public by design — the address search and click-to-address probe must
 * work signed-out — so no `authenticate` middleware. Mounted at `/api/geo/geocode`.
 */
export function buildGeocodeModule(): Router {
  const service = new GeocodingService({
    baseUrl: config.geocoderBaseUrl,
    userAgent: config.geocoderUserAgent,
    language: config.geocoderLanguage,
  });
  const controller = new GeocodingController(service);

  const router = Router();
  router.get('/search', validateQuery(searchQuerySchema), asyncHandler(controller.search));
  router.get('/reverse', validateQuery(reverseQuerySchema), asyncHandler(controller.reverse));

  return router;
}
