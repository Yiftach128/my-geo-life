import { z } from 'zod';
import { createLandmarkSchema } from './create-landmark.dto.js';
import { hexColorSchema } from '../../shared/schemas/geo.schemas.js';
import { LANDMARK_ICON_KEYS } from '../domain/landmark-icon.js';
import { Point } from '../../shared/domain/point.js';

// Boundary-only defaults: defaults live on create, not update. `.partial()` alone
// keeps the `.default()` on color/iconUrl, which would reset those fields on any
// update that omits them; override them to plain-optional so an omitted field is
// left unchanged by the repository (which skips `undefined` values).
export const updateLandmarkSchema = createLandmarkSchema.partial().extend({
  color: hexColorSchema.optional(),
  iconUrl: z.enum(LANDMARK_ICON_KEYS).optional(),
});

export type UpdateLandmarkInput = z.infer<typeof updateLandmarkSchema>;

/** Partial update holder; undefined fields are ignored by the repository. */
export class UpdateLandmarkDto {
  readonly name?: string;
  readonly description?: string;
  readonly position?: Point;
  readonly iconUrl?: string;
  readonly color?: string;

  constructor(data: UpdateLandmarkInput) {
    this.name = data.name;
    this.description = data.description;
    this.position = data.position;
    this.iconUrl = data.iconUrl;
    this.color = data.color;
  }
}
