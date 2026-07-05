import { z } from 'zod';
import { pointSchema, geoStyleSchemaWithDefault } from '../../shared/schemas/geo.schemas.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export const createPolygonSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(80, { message: 'Name must be less than 80 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional(),
  points: z.array(pointSchema).min(3, { message: 'A polygon needs at least 3 points' }),
  style: geoStyleSchemaWithDefault,
});

export type CreatePolygonInput = z.infer<typeof createPolygonSchema>;

export class CreatePolygonDto {
  readonly name: string;
  readonly description?: string;
  readonly points: Point[];
  readonly style: GeoStyle;

  constructor(data: CreatePolygonInput) {
    this.name = data.name;
    this.description = data.description;
    this.points = data.points;
    this.style = data.style;
  }
}
