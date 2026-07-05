import { ICircleRepository } from './repository/circle.repository.interface.js';
import { Circle } from './domain/circle.entity.js';
import { CreateCircleDto } from './dto/create-circle.dto.js';
import { UpdateCircleDto } from './dto/update-circle.dto.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface ICircleService {
  getAll(ownerId: string): Promise<Circle[]>;
  getById(id: string, ownerId: string): Promise<Circle>;
  create(dto: CreateCircleDto, ownerId: string): Promise<Circle>;
  update(id: string, dto: UpdateCircleDto, ownerId: string): Promise<Circle>;
  delete(id: string, ownerId: string): Promise<void>;
}

export class CircleService implements ICircleService {
  constructor(private readonly repository: ICircleRepository) {}

  getAll(ownerId: string): Promise<Circle[]> {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Circle> {
    const circle = await this.repository.findByIdForOwner(id, ownerId);
    if (!circle) throw new NotFoundError('Circle not found');
    return circle;
  }

  create(dto: CreateCircleDto, ownerId: string): Promise<Circle> {
    return this.repository.create({
      ownerId,
      name: dto.name,
      description: dto.description,
      center: dto.center,
      radius: dto.radius,
      style: dto.style,
    });
  }

  async update(id: string, dto: UpdateCircleDto, ownerId: string): Promise<Circle> {
    const updated = await this.repository.update(id, ownerId, {
      name: dto.name,
      description: dto.description,
      center: dto.center,
      radius: dto.radius,
      style: dto.style,
    });
    if (!updated) throw new NotFoundError('Circle not found');
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const deleted = await this.repository.delete(id, ownerId);
    if (!deleted) throw new NotFoundError('Circle not found');
  }
}
