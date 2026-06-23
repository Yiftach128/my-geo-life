import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  createdAt: Date;
  tokenVersion: number;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,   // removes __v
  toJSON: {
    transform: (doc: IUser, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password; // never expose this to client
      delete ret.tokenVersion; 
      return ret; // → goes straight to JSON.stringify() → sent as text over network
    }
  }
});

export default mongoose.model<IUser>('User', userSchema);