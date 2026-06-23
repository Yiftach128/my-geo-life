import { Schema } from 'mongoose';

/* ----------------------------------------------------------------------------
 * Framework-free domain types (value objects).
 * Plain TypeScript: no mongoose import, no MongoDB concepts. Your domain /
 * business logic can use IPoint and IStyle without knowing a database exists.
 * -------------------------------------------------------------------------- */

export interface IPoint {
  x: number;
  y: number;
}

export interface IStyle {
  strokeColor: string;
  fillColor: string;
  weight: number;
  opacity: number;
  fillOpacity: number;
  dashArray?: string;
}

/* ----------------------------------------------------------------------------
 * Mongoose-side building blocks shared by the three models.
 * Reusing these is COMPOSITION (each model embeds the same sub-schema), NOT the
 * inheritance we removed — no model derives from another. This just keeps the
 * point/style definitions and the JSON output in one place instead of three.
 * -------------------------------------------------------------------------- */

export const pointSchema = new Schema<IPoint>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  { _id: false }
);

export const styleSchema = new Schema<IStyle>(
  {
    strokeColor: { type: String, default: '#3388ff' },
    fillColor:   { type: String, default: '#3388ff' },
    weight:      { type: Number, default: 3 },
    opacity:     { type: Number, default: 1 },
    fillOpacity: { type: Number, default: 0.2 },
    dashArray:   { type: String }
  },
  { _id: false }
);

// Shared schema options so all three documents serialize the same way
// (drop __v, expose `id` instead of `_id`). No discriminatorKey anymore.
export const baseSchemaOptions = {
  versionKey: false,
  toJSON: {
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
};
