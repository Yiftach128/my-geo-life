import { IPolygonRepository, UpdatePolygonData } from './repository/polygon.repository.interface.js';
import { Polygon } from './domain/polygon.entity.js';
import { CreatePolygonDto } from './dto/create-polygon.dto.js';
import { UpdatePolygonDto } from './dto/update-polygon.dto.js';
import { Point, centroid } from '../shared/domain/point.js';
import { ReverseGeocoder } from '../geocode/geocode.service.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface IPolygonService {
  getAll(ownerId: string): Promise<Polygon[]>;
  getById(id: string, ownerId: string): Promise<Polygon>;
  create(dto: CreatePolygonDto, ownerId: string): Promise<Polygon>;
  update(id: string, dto: UpdatePolygonDto, ownerId: string): Promise<Polygon>;
  delete(id: string, ownerId: string): Promise<void>;
}

export class PolygonService implements IPolygonService {
  constructor(
    private readonly repository: IPolygonRepository,
    private readonly geocoder: ReverseGeocoder,
  ) {}

  getAll(ownerId: string): Promise<Polygon[]> {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Polygon> {
    const polygon = await this.repository.findByIdForOwner(id, ownerId);
    if (!polygon) throw new NotFoundError('Polygon not found');
    return polygon;
  }

  async create(dto: CreatePolygonDto, ownerId: string): Promise<Polygon> {
    const addressLabel = await this.resolveAddressLabel(centroid(dto.points));
    return this.repository.create({
      ownerId,
      name: dto.name,
      description: dto.description,
      points: dto.points,
      style: dto.style,
      addressLabel,
    });
  }

  async update(id: string, dto: UpdatePolygonDto, ownerId: string): Promise<Polygon> {
    const data: UpdatePolygonData = {
      name: dto.name,
      description: dto.description,
      points: dto.points,
      style: dto.style,
    };
    // A polygon's stored address follows its centroid; only recompute when the vertices change.
    if (dto.points !== undefined) {
      data.addressLabel = await this.resolveAddressLabel(centroid(dto.points));
    }
    const updated = await this.repository.update(id, ownerId, data);
    if (!updated) throw new NotFoundError('Polygon not found');
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
    if (!deleted) throw new NotFoundError('Polygon not found');
  }
}
