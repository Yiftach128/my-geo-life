import mongoose, { Schema, Model } from 'mongoose';
import { IPoint, pointSchema, baseSchemaOptions } from './common';

// Plain domain type — note it does NOT `extends Document`, so it carries no
// mongoose coupling. App logic can depend on ILandmark without importing mongoose.
// (The lone exception is `owner: ObjectId`; switch to `string` for full independence.)
export interface ILandmark {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  position: IPoint;
  icon_url?: string;
  color?: string;
  createdAt: Date;
}

const landmarkSchema = new Schema<ILandmark>(
  {
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true },
    description: { type: String },
    position:    { type: pointSchema, required: true },
    icon_url:    { type: String },
    color:       { type: String, default: '#3388ff' },
    createdAt:   { type: Date, default: Date.now }
  },
  baseSchemaOptions
);

// Model name 'Landmark' -> collection 'landmarks'.
const Landmark: Model<ILandmark> = mongoose.model<ILandmark>('Landmark', landmarkSchema);
export default Landmark;
