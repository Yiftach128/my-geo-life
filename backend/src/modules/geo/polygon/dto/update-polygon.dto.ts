import { z } from 'zod';
import { createPolygonSchema } from './create-polygon.dto.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export const updatePolygonSchema = createPolygonSchema.partial();

export type UpdatePolygonInput = z.infer<typeof updatePolygonSchema>;

export class UpdatePolygonDto {
  readonly name?: string;
  readonly description?: string;
  readonly points?: Point[];
  readonly style?: GeoStyle;

  constructor(data: UpdatePolygonInput) {
    this.name = data.name;
    this.description = data.description;
    this.points = data.points;
    this.style = data.style;
  }
}
