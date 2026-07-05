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
  age?: number;
  tokenVersion: number;
  createdAt: Date;
}

const userSchema = new Schema<IUserSchema>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    tokenVersion: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const UserModel: Model<IUserSchema> = mongoose.model<IUserSchema>('User', userSchema);
