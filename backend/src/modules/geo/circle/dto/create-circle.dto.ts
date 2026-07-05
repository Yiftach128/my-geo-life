import { z } from 'zod';
import { pointSchema, geoStyleSchemaWithDefault } from '../../shared/schemas/geo.schemas.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

export const createCircleSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(80, { message: 'Name must be less than 80 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional(),
  center: pointSchema,
  radius: z.number().positive({ message: 'radius must be greater than 0' }),
  style: geoStyleSchemaWithDefault,
});

export type CreateCircleInput = z.infer<typeof createCircleSchema>;

export class CreateCircleDto {
  readonly name: string;
  readonly description?: string;
  readonly center: Point;
  readonly radius: number;
  readonly style: GeoStyle;

  constructor(data: CreateCircleInput) {
    this.name = data.name;
    this.description = data.description;
    this.center = data.center;
    this.radius = data.radius;
    this.style = data.style;
  }
}
