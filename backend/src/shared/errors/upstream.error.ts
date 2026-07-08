import { AppError } from './app-error.js';

/**
 * Raised when an upstream third-party service (e.g. the Nominatim geocoder)
 * fails or rate-limits us. Surfaced to the client as a 503 so it is treated as
 * a transient "try again later" condition, never leaking the upstream detail.
 */
export class UpstreamGeocodingError extends AppError {
  readonly statusCode = 503;

  constructor(message = 'Geocoding service temporarily unavailable') {
    super(message);
  }
}
