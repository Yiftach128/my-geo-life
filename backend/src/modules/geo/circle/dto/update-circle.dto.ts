import { z } from 'zod';
import { createCircleSchema } from './create-circle.dto.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export const updateCircleSchema = createCircleSchema.partial();

export type UpdateCircleInput = z.infer<typeof updateCircleSchema>;

export class UpdateCircleDto {
  readonly name?: string;
  readonly description?: string;
  readonly center?: Point;
  readonly radius?: number;
  readonly style?: GeoStyle;

  constructor(data: UpdateCircleInput) {
    this.name = data.name;
    this.description = data.description;
    this.center = data.center;
    this.radius = data.radius;
    this.style = data.style;
  }
}
