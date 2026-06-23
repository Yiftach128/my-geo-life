import mongoose, { Schema, Model } from 'mongoose';
import { IPoint, IStyle, pointSchema, styleSchema, baseSchemaOptions } from './common';

// Plain domain type — no mongoose coupling (besides the owner id type).
// Covers squares AND custom polygons — a square is just a 4-point polygon.
export interface IPolygon {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  points: IPoint[]; // ordered vertices; the renderer closes the shape for you
  style: IStyle;
  createdAt: Date;
}

const polygonSchema = new Schema<IPolygon>(
  {
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true },
    description: { type: String },
    points: {
      type: [pointSchema],
      required: true,
      validate: {
        validator: (pts: IPoint[]) => Array.isArray(pts) && pts.length >= 3,
        message: 'A polygon needs at least 3 points.'
      }
    },
    style:     { type: styleSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now }
  },
  baseSchemaOptions
);

// Model name 'Polygon' -> collection 'polygons'.
const Polygon: Model<IPolygon> = mongoose.model<IPolygon>('Polygon', polygonSchema);
export default Polygon;
