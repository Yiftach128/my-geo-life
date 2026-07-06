import { z } from 'zod';

/**
 * Shared validation for a geocoded address (a picked Nominatim result): a display
 * label plus its coordinates. Reused by the create-user, update-user and register
 * DTOs so the shape is defined once.
 */
export const addressSchema = z.object({
  label: z.string().min(1).max(200),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
