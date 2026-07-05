import { ILandmarkRepository } from './repository/landmark.repository.interface.js';
import { Landmark } from './domain/landmark.entity.js';
import { CreateLandmarkDto } from './dto/create-landmark.dto.js';
import { UpdateLandmarkDto } from './dto/update-landmark.dto.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface ILandmarkService {
  getAll(ownerId: string): Promise<Landmark[]>;
  getById(id: string, ownerId: string): Promise<Landmark>;
  create(dto: CreateLandmarkDto, ownerId: string): Promise<Landmark>;
  update(id: string, dto: UpdateLandmarkDto, ownerId: string): Promise<Landmark>;
  delete(id: string, ownerId: string): Promise<void>;
}

export class LandmarkService implements ILandmarkService {
  constructor(private readonly repository: ILandmarkRepository) {}

  getAll(ownerId: string): Promise<Landmark[]> {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Landmark> {
    const landmark = await this.repository.findByIdForOwner(id, ownerId);
    if (!landmark) throw new NotFoundError('Landmark not found');
    return landmark;
  }

  create(dto: CreateLandmarkDto, ownerId: string): Promise<Landmark> {
    return this.repository.create({
      ownerId,
      name: dto.name,
      description: dto.description,
      position: dto.position,
      iconUrl: dto.iconUrl,
      color: dto.color,
    });
  }

  async update(id: string, dto: UpdateLandmarkDto, ownerId: string): Promise<Landmark> {
    const updated = await this.repository.update(id, ownerId, {
      name: dto.name,
      description: dto.description,
      position: dto.position,
      iconUrl: dto.iconUrl,
      color: dto.color,
    });
    if (!updated) throw new NotFoundError('Landmark not found');
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const deleted = await this.repository.delete(id, ownerId);
    if (!deleted) throw new NotFoundError('Landmark not found');
  }
}
