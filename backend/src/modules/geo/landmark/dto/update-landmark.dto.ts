import { z } from 'zod';
import { createLandmarkSchema } from './create-landmark.dto.js';
import { Point } from '../../shared/domain/point.js';

export const updateLandmarkSchema = createLandmarkSchema.partial();

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
