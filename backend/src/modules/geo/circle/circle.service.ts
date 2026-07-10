import { ICircleRepository, UpdateCircleData } from './repository/circle.repository.interface.js';
import { Circle } from './domain/circle.entity.js';
import { CreateCircleDto } from './dto/create-circle.dto.js';
import { UpdateCircleDto } from './dto/update-circle.dto.js';
import { Point } from '../shared/domain/point.js';
import { ReverseGeocoder } from '../geocode/geocode.service.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface ICircleService {
  getAll(ownerId: string): Promise<Circle[]>;
  getById(id: string, ownerId: string): Promise<Circle>;
  create(dto: CreateCircleDto, ownerId: string): Promise<Circle>;
  update(id: string, dto: UpdateCircleDto, ownerId: string): Promise<Circle>;
  delete(id: string, ownerId: string): Promise<void>;
}

export class CircleService implements ICircleService {
  constructor(
    private readonly repository: ICircleRepository,
    private readonly geocoder: ReverseGeocoder,
  ) {}

  getAll(ownerId: string): Promise<Circle[]> {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Circle> {
    const circle = await this.repository.findByIdForOwner(id, ownerId);
    if (!circle) throw new NotFoundError('Circle not found');
    return circle;
  }

  async create(dto: CreateCircleDto, ownerId: string): Promise<Circle> {
    const addressLabel = await this.resolveAddressLabel(dto.center);
    return this.repository.create({
      ownerId,
      name: dto.name,
      description: dto.description,
      center: dto.center,
      radius: dto.radius,
      style: dto.style,
      addressLabel,
    });
  }

  async update(id: string, dto: UpdateCircleDto, ownerId: string): Promise<Circle> {
    const data: UpdateCircleData = {
      name: dto.name,
      description: dto.description,
      center: dto.center,
      radius: dto.radius,
      style: dto.style,
    };
    // A circle's stored address follows its center; only recompute when the center moves.
    if (dto.center !== undefined) {
      data.addressLabel = await this.resolveAddressLabel(dto.center);
    }
    const updated = await this.repository.update(id, ownerId, data);
    if (!updated) throw new NotFoundError('Circle not found');
    return updated;
  }

  /** Reverse-geocode a point to a display label; a lookup failure must never block the write. */
  private async resolveAddressLabel(point: Point): Promise<string | null> {
    try {
      const { label } = await this.geocoder.reverse(point.lat, point.lng);
      return label;
    } catch {
      return null;
    }
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const deleted = await this.repository.delete(id, ownerId);
    if (!deleted) throw new NotFoundError('Circle not found');
  }
}
