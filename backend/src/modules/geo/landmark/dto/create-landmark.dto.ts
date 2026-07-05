import { z } from 'zod';
import { pointSchema, hexColorSchema } from '../../shared/schemas/geo.schemas.js';
import { Point } from '../../shared/domain/point.js';
import { DEFAULT_COLOR } from '../../shared/domain/geo-style.js';
import { LANDMARK_ICON_KEYS, DEFAULT_ICON } from '../domain/landmark-icon.js';

export const createLandmarkSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(80, { message: 'Name must be less than 80 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional(),
  position: pointSchema,
  iconUrl: z.enum(LANDMARK_ICON_KEYS, { message: 'iconUrl must be one of the preset icons' }).default(DEFAULT_ICON),
  color: hexColorSchema.default(DEFAULT_COLOR),
});

export type CreateLandmarkInput = z.infer<typeof createLandmarkSchema>;

/** Simple data holder. Built from already-validated input by validateBody. */
export class CreateLandmarkDto {
  readonly name: string;
  readonly description?: string;
  readonly position: Point;
  readonly iconUrl: string;
  readonly color: string;

  constructor(data: CreateLandmarkInput) {
    this.name = data.name;
    this.description = data.description;
    this.position = data.position;
    this.iconUrl = data.iconUrl;
    this.color = data.color;
  }
}
