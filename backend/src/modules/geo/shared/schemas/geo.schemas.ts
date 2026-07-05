import { z } from 'zod';
import { DEFAULT_GEO_STYLE } from '../domain/geo-style.js';

/**
 * Zod validation schemas shared by every geo create/update DTO. Reusing these is
 * composition (each DTO embeds the same point/style schema), keeping the
 * coordinate and style validation rules in one place. Default values are sourced
 * from DEFAULT_GEO_STYLE — the single source of truth in the domain — never
 * re-hardcoded here.
 */

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { message: 'Must be a hex color like #3388ff' });

export const pointSchema = z.object({
  lat: z
    .number()
    .min(-90, { message: 'lat must be between -90 and 90' })
    .max(90, { message: 'lat must be between -90 and 90' }),
  lng: z
    .number()
    .min(-180, { message: 'lng must be between -180 and 180' })
    .max(180, { message: 'lng must be between -180 and 180' }),
});

/**
 * Every field defaults (from DEFAULT_GEO_STYLE), so a partially-supplied `style`
 * has its missing fields filled in during validation.
 */
export const geoStyleSchema = z.object({
  strokeColor: hexColorSchema.default(DEFAULT_GEO_STYLE.strokeColor),
  fillColor: hexColorSchema.default(DEFAULT_GEO_STYLE.fillColor),
  weight: z.number().min(0).default(DEFAULT_GEO_STYLE.weight),
  opacity: z.number().min(0).max(1).default(DEFAULT_GEO_STYLE.opacity),
  fillOpacity: z.number().min(0).max(1).default(DEFAULT_GEO_STYLE.fillOpacity),
  dashArray: z.string().optional(),
});

/**
 * Style schema for create DTOs: an entirely omitted `style` falls back to a
 * fresh copy of DEFAULT_GEO_STYLE; a partial `style` is completed by the
 * per-field defaults above. Either way the resulting DTO carries a complete
 * GeoStyle. (Zod v4 `.default()` takes the full output value, so a bare `{}` is
 * not accepted here.)
 */
export const geoStyleSchemaWithDefault = geoStyleSchema.default(() => ({ ...DEFAULT_GEO_STYLE }));
