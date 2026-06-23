import mongoose, { Schema, Model } from 'mongoose';
import { IPoint, IStyle, pointSchema, styleSchema, baseSchemaOptions } from './common';

// Plain domain type — no mongoose coupling (besides the owner id type).
export interface ICircle {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  center: IPoint;
  radius: number; // same units as x/y. (L.circle reads radius as meters on a real
                  // map; on L.CRS.Simple it's map units — match your CRS.)
  style: IStyle;
  createdAt: Date;
}

const circleSchema = new Schema<ICircle>(
  {
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true },
    description: { type: String },
    center:      { type: pointSchema, required: true },
    radius:      { type: Number, required: true, min: 0 },
    style:       { type: styleSchema, default: () => ({}) },
    createdAt:   { type: Date, default: Date.now }
  },
  baseSchemaOptions
);

// Model name 'Circle' -> collection 'circles'.
const Circle: Model<ICircle> = mongoose.model<ICircle>('Circle', circleSchema);
export default Circle;
