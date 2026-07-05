import mongoose, { Schema, Model, Types } from 'mongoose';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';
import { pointSchema, geoStyleSchema } from '../../shared/persistence/geo.sub-schemas.js';

export interface IPolygonSchema {
  owner: Types.ObjectId;
  name: string;
  description?: string;
  points: Point[];
  style: GeoStyle;
  createdAt: Date;
}

const polygonSchema = new Schema<IPolygonSchema>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    points: {
      type: [pointSchema],
      required: true,
      validate: {
        validator: (pts: Point[]) => Array.isArray(pts) && pts.length >= 3,
        message: 'A polygon needs at least 3 points.',
      },
    },
    style: { type: geoStyleSchema, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const PolygonModel: Model<IPolygonSchema> = mongoose.model<IPolygonSchema>(
  'Polygon',
  polygonSchema,
);
