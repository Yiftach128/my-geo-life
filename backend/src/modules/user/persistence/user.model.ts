import mongoose, { Schema, Model } from 'mongoose';

/**
 * Persistence shape only. Note `password` here is the hashed value — the domain
 * entity calls it `passwordHash`; the mapper bridges the naming. No `toJSON`
 * transform: response shaping now lives in UserResponseDto.
 */
export interface IUserSchema {
  name: string;
  email: string;
  password: string;
  address?: { label: string; lat: number; lon: number };
  tokenVersion: number;
  role: 'user' | 'admin';
  createdAt: Date;
}

// Nested (no own _id); the whole path stays undefined until an address is saved.
const addressSubSchema = new Schema(
  {
    label: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUserSchema>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: addressSubSchema },
    tokenVersion: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const UserModel: Model<IUserSchema> = mongoose.model<IUserSchema>('User', userSchema);
