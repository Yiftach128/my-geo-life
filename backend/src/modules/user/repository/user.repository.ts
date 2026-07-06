import { Model, Types } from 'mongoose';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from './user.repository.interface.js';
import { User } from '../domain/user.entity.js';
import { IUserSchema } from '../persistence/user.model.js';
import { UserMapper } from '../persistence/user.mapper.js';
import { ConflictError } from '../../../shared/errors/index.js';

export class UserRepository implements IUserRepository {
  constructor(private readonly model: Model<IUserSchema>) {}

  async findById(id: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id);

    if (doc) {
      return UserMapper.toDomain(doc);
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email });

    if (doc) {
      return UserMapper.toDomain(doc);
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    const docs = await this.model.find();
    return docs.map((doc) => UserMapper.toDomain(doc));
  }

  async create(data: CreateUserData): Promise<User> {
    try {
      const doc = await this.model.create({
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        address: data.address,
      });
      return UserMapper.toDomain(doc);
    } catch (err) {
      if (UserRepository.isDuplicateKeyError(err)) {
        throw new ConflictError('Email already in use');
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.email !== undefined) update.email = data.email;
    if (data.passwordHash !== undefined) update.password = data.passwordHash;
    if (data.address !== undefined) update.address = data.address;

    try {
      const doc = await this.model.findByIdAndUpdate(id, update, { new: true });
      return doc ? UserMapper.toDomain(doc) : null;
    } catch (err) {
      if (UserRepository.isDuplicateKeyError(err)) {
        throw new ConflictError('Email already in use');
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.model.findByIdAndDelete(id);
    return doc !== null;
  }

  async incrementTokenVersion(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.model.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });
  }

  /** Mongo raises code 11000 when a write violates a unique index. */
  private static isDuplicateKeyError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
  }
}
