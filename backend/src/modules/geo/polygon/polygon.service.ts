import { IPolygonRepository } from './repository/polygon.repository.interface.js';
import { Polygon } from './domain/polygon.entity.js';
import { CreatePolygonDto } from './dto/create-polygon.dto.js';
import { UpdatePolygonDto } from './dto/update-polygon.dto.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface IPolygonService {
  getAll(ownerId: string): Promise<Polygon[]>;
  getById(id: string, ownerId: string): Promise<Polygon>;
  create(dto: CreatePolygonDto, ownerId: string): Promise<Polygon>;
  update(id: string, dto: UpdatePolygonDto, ownerId: string): Promise<Polygon>;
  delete(id: string, ownerId: string): Promise<void>;
}

export class PolygonService implements IPolygonService {
  constructor(private readonly repository: IPolygonRepository) {}

  getAll(ownerId: string): Promise<Polygon[]> {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Polygon> {
    const polygon = await this.repository.findByIdForOwner(id, ownerId);
    if (!polygon) throw new NotFoundError('Polygon not found');
    return polygon;
  }

  create(dto: CreatePolygonDto, ownerId: string): Promise<Polygon> {
    return this.repository.create({
      ownerId,
      name: dto.name,
      description: dto.description,
      points: dto.points,
      style: dto.style,
    });
  }

  async update(id: string, dto: UpdatePolygonDto, ownerId: string): Promise<Polygon> {
    const updated = await this.repository.update(id, ownerId, {
      name: dto.name,
      description: dto.description,
      points: dto.points,
      style: dto.style,
    });
    if (!updated) throw new NotFoundError('Polygon not found');
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const deleted = await this.repository.delete(id, ownerId);
    if (!deleted) throw new NotFoundError('Polygon not found');
  }
}
