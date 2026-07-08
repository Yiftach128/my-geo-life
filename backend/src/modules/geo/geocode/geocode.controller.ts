import { Request, Response } from 'express';
import { GeocodingService } from './geocode.service.js';
import { SearchQuery, ReverseQuery } from './geocode.schemas.js';

/**
 * Thin HTTP adapter over the geocoding proxy. Reads the validated query off
 * `req.dto` (attached by `validateQuery`) and returns the service's shaped DTO —
 * no try/catch (asyncHandler) and no business logic of its own.
 */
export class GeocodingController {
  constructor(private readonly service: GeocodingService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    const { q, limit, lang } = req.dto as SearchQuery;
    res.json(await this.service.search(q, limit, lang));
  };

  reverse = async (req: Request, res: Response): Promise<void> => {
    const { lat, lon, lang } = req.dto as ReverseQuery;
    res.json(await this.service.reverse(lat, lon, lang));
  };
}
