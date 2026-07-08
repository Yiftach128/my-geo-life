import { z } from 'zod';

/** `GET /search?q=&limit=&lang=` — forward geocoding query params. */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'q is required'),
  limit: z.coerce.number().int().min(1).max(10).default(5),
  lang: z.string().optional(),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** `GET /reverse?lat=&lon=&lang=` — reverse geocoding query params. */
export const reverseQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  lang: z.string().optional(),
});
export type ReverseQuery = z.infer<typeof reverseQuerySchema>;

// --- Upstream (Nominatim) response schemas ---------------------------------
// We validate what Nominatim returns before shaping it; a mismatch is treated as
// an upstream failure. `z.object` strips Nominatim's many extra fields, and
// `z.coerce.number()` turns its string `lat`/`lon` into numbers for us.

/** One item of Nominatim's `/search` array (only the fields we surface). */
export const nominatimSearchResponseSchema = z.array(
  z.object({
    place_id: z.number(),
    lat: z.coerce.number(),
    lon: z.coerce.number(),
    display_name: z.string(),
  }),
);

/** Nominatim's `/reverse` object. `display_name` is absent on a no-result (`{ error }`). */
export const nominatimReverseResponseSchema = z.object({
  display_name: z.string().optional(),
});

// --- Shaped DTOs returned to the client ------------------------------------

/** A search suggestion, ready to render: numeric coords + shortened label. */
export interface GeocodeSearchResult {
  place_id: number;
  lat: number;
  lon: number;
  label: string;
}

/** A reverse lookup result: the shortened address, or null when none was found. */
export interface GeocodeReverseResult {
  label: string | null;
}
