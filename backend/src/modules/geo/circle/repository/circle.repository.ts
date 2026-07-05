import { Model, Types } from 'mongoose';
import {
  ICircleRepository,
  CreateCircleData,
  UpdateCircleData,
} from './circle.repository.interface.js';
import { Circle } from '../domain/circle.entity.js';
import { ICircleSchema } from '../persistence/circle.model.js';
import { CircleMapper } from '../persistence/circle.mapper.js';

export class CircleRepository implements ICircleRepository {
  constructor(private readonly model: Model<ICircleSchema>) {}

  async findAllByOwner(ownerId: string): Promise<Circle[]> {
    const docs = await this.model.find({ owner: ownerId });
    return docs.map((doc) => CircleMapper.toDomain(doc));
  }

  async findByIdForOwner(id: string, ownerId: string): Promise<Circle | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findOne({ _id: id, owner: ownerId });
    return doc ? CircleMapper.toDomain(doc) : null;
  }

  async create(data: CreateCircleData): Promise<Circle> {
    const doc = await this.model.create({
      owner: new Types.ObjectId(data.ownerId),
      name: data.name,
      description: data.description,
      center: data.center,
      radius: data.radius,
      style: data.style,
    });
    return CircleMapper.toDomain(doc);
  }

  async update(id: string, ownerId: string, data: UpdateCircleData): Promise<Circle | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.center !== undefined) update.center = data.center;
    if (data.radius !== undefined) update.radius = data.radius;
    if (data.style !== undefined) update.style = data.style;

    const doc = await this.model.findOneAndUpdate({ _id: id, owner: ownerId }, update, {
      new: true,
    });
    return doc ? CircleMapper.toDomain(doc) : null;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.model.findOneAndDelete({ _id: id, owner: ownerId });
    return doc !== null;
  }
}
