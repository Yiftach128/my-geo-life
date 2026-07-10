import { Model, Types } from 'mongoose';
import {
  IPolygonRepository,
  CreatePolygonData,
  UpdatePolygonData,
} from './polygon.repository.interface.js';
import { Polygon } from '../domain/polygon.entity.js';
import { IPolygonSchema } from '../persistence/polygon.model.js';
import { PolygonMapper } from '../persistence/polygon.mapper.js';

export class PolygonRepository implements IPolygonRepository {
  constructor(private readonly model: Model<IPolygonSchema>) {}

  async findAllByOwner(ownerId: string): Promise<Polygon[]> {
    const docs = await this.model.find({ owner: ownerId });
    return docs.map((doc) => PolygonMapper.toDomain(doc));
  }

  async findByIdForOwner(id: string, ownerId: string): Promise<Polygon | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findOne({ _id: id, owner: ownerId });
    return doc ? PolygonMapper.toDomain(doc) : null;
  }

  async create(data: CreatePolygonData): Promise<Polygon> {
    const doc = await this.model.create({
      owner: new Types.ObjectId(data.ownerId),
      name: data.name,
      description: data.description,
      points: data.points,
      style: data.style,
      addressLabel: data.addressLabel,
    });
    return PolygonMapper.toDomain(doc);
  }

  async update(id: string, ownerId: string, data: UpdatePolygonData): Promise<Polygon | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.points !== undefined) update.points = data.points;
    if (data.style !== undefined) update.style = data.style;
    if (data.addressLabel !== undefined) update.addressLabel = data.addressLabel;

    const doc = await this.model.findOneAndUpdate({ _id: id, owner: ownerId }, update, {
      new: true,
      runValidators: true,
    });
    return doc ? PolygonMapper.toDomain(doc) : null;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.model.findOneAndDelete({ _id: id, owner: ownerId });
    return doc !== null;
  }
}
