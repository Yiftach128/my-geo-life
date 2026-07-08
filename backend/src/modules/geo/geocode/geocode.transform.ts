import { UpstreamGeocodingError } from '../../../shared/errors/index.js';
import {
  nominatimSearchResponseSchema,
  nominatimReverseResponseSchema,
  type GeocodeSearchResult,
  type GeocodeReverseResult,
} from './geocode.schemas.js';

/**
 * Nominatim's `display_name` is long and comma-heavy. Keep the 3 most specific
 * leading segments plus the country (last segment) — enough to identify a place
 * without the middle noise. Short names (<= 3 parts) are returned as-is.
 */
export function shortenDisplayName(name: string): string {
  const parts = name.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(', ');
  const country = parts[parts.length - 1];
  return [...parts.slice(0, 3), country].join(', ');
}

/**
 * Validate and shape Nominatim's `/search` array into ready-to-render suggestions.
 * An unexpected upstream shape is surfaced as an `UpstreamGeocodingError` (503).
 */
export function toSearchResults(raw: unknown): GeocodeSearchResult[] {
  const parsed = nominatimSearchResponseSchema.safeParse(raw);
  if (!parsed.success) throw new UpstreamGeocodingError();
  return parsed.data.map((r) => ({
    place_id: r.place_id,
    lat: r.lat,
    lon: r.lon,
    label: shortenDisplayName(r.display_name),
  }));
}

/**
 * Validate and shape Nominatim's `/reverse` object. A missing `display_name`
 * (the no-result `{ error }` case) becomes `label: null`.
 */
export function toReverseResult(raw: unknown): GeocodeReverseResult {
  const parsed = nominatimReverseResponseSchema.safeParse(raw);
  if (!parsed.success) throw new UpstreamGeocodingError();
  return { label: parsed.data.display_name ? shortenDisplayName(parsed.data.display_name) : null };
}
