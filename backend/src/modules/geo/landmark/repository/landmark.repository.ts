import { Model, Types } from 'mongoose';
import {
  ILandmarkRepository,
  CreateLandmarkData,
  UpdateLandmarkData,
} from './landmark.repository.interface.js';
import { Landmark } from '../domain/landmark.entity.js';
import { ILandmarkSchema } from '../persistence/landmark.model.js';
import { LandmarkMapper } from '../persistence/landmark.mapper.js';

export class LandmarkRepository implements ILandmarkRepository {
  constructor(private readonly model: Model<ILandmarkSchema>) {}

  async findAllByOwner(ownerId: string): Promise<Landmark[]> {
    const docs = await this.model.find({ owner: ownerId });
    return docs.map((doc) => LandmarkMapper.toDomain(doc));
  }

  async findByIdForOwner(id: string, ownerId: string): Promise<Landmark | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findOne({ _id: id, owner: ownerId });
    return doc ? LandmarkMapper.toDomain(doc) : null;
  }

  async create(data: CreateLandmarkData): Promise<Landmark> {
    const doc = await this.model.create({
      owner: new Types.ObjectId(data.ownerId),
      name: data.name,
      description: data.description,
      position: data.position,
      iconUrl: data.iconUrl,
      color: data.color,
      addressLabel: data.addressLabel,
    });
    return LandmarkMapper.toDomain(doc);
  }

  async update(
    id: string,
    ownerId: string,
    data: UpdateLandmarkData,
  ): Promise<Landmark | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.position !== undefined) update.position = data.position;
    if (data.iconUrl !== undefined) update.iconUrl = data.iconUrl;
    if (data.color !== undefined) update.color = data.color;
    if (data.addressLabel !== undefined) update.addressLabel = data.addressLabel;

    const doc = await this.model.findOneAndUpdate({ _id: id, owner: ownerId }, update, {
      new: true,
    });
    return doc ? LandmarkMapper.toDomain(doc) : null;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.model.findOneAndDelete({ _id: id, owner: ownerId });
    return doc !== null;
  }
}
