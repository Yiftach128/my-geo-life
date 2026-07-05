import mongoose, { Schema, Model, Types } from 'mongoose';
import { Point } from '../../shared/domain/point.js';
import { pointSchema } from '../../shared/persistence/geo.sub-schemas.js';

/**
 * Persistence shape only. `owner` is a User ObjectId (indexed for per-user
 * queries); the mapper renames it to `ownerId` on the domain side. No `toJSON`
 * transform — response shaping lives in LandmarkResponseDto.
 */
export interface ILandmarkSchema {
  owner: Types.ObjectId;
  name: string;
  description?: string;
  position: Point;
  iconUrl?: string;
  color: string;
  createdAt: Date;
}

const landmarkSchema = new Schema<ILandmarkSchema>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    position: { type: pointSchema, required: true },
    iconUrl: { type: String },
    color: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const LandmarkModel: Model<ILandmarkSchema> = mongoose.model<ILandmarkSchema>(
  'Landmark',
  landmarkSchema,
);
