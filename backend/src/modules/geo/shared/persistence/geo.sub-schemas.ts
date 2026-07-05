import { Schema } from 'mongoose';
import { Point } from '../domain/point.js';
import { GeoStyle } from '../domain/geo-style.js';

/**
 * Mongoose sub-schemas shared by the three geo models (composition, mirroring
 * the legacy `common.ts`). Each model embeds these instead of redeclaring the
 * point/style shape. `_id: false` — these are embedded value objects, not docs.
 */

export const pointSchema = new Schema<Point>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

export const geoStyleSchema = new Schema<GeoStyle>(
  {
    strokeColor: { type: String, required: true },
    fillColor: { type: String, required: true },
    weight: { type: Number, required: true },
    opacity: { type: Number, required: true },
    fillOpacity: { type: Number, required: true },
    dashArray: { type: String },
  },
  { _id: false },
);
