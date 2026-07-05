import mongoose, { Schema, Model, Types } from 'mongoose';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';
import { pointSchema, geoStyleSchema } from '../../shared/persistence/geo.sub-schemas.js';

export interface ICircleSchema {
  owner: Types.ObjectId;
  name: string;
  description?: string;
  center: Point;
  radius: number;
  style: GeoStyle;
  createdAt: Date;
}

const circleSchema = new Schema<ICircleSchema>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    center: { type: pointSchema, required: true },
    radius: { type: Number, required: true, min: 0 },
    style: { type: geoStyleSchema, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const CircleModel: Model<ICircleSchema> = mongoose.model<ICircleSchema>(
  'Circle',
  circleSchema,
);
