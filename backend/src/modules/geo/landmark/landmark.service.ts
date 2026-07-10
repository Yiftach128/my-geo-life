import { ILandmarkRepository, UpdateLandmarkData } from './repository/landmark.repository.interface.js';
import { Landmark } from './domain/landmark.entity.js';
import { CreateLandmarkDto } from './dto/create-landmark.dto.js';
import { UpdateLandmarkDto } from './dto/update-landmark.dto.js';
import { Point } from '../shared/domain/point.js';
import { ReverseGeocoder } from '../geocode/geocode.service.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface ILandmarkService {
  getAll(ownerId: string): Promise<Landmark[]>;
  getById(id: string, ownerId: string): Promise<Landmark>;
  create(dto: CreateLandmarkDto, ownerId: string): Promise<Landmark>;
  update(id: string, dto: UpdateLandmarkDto, ownerId: string): Promise<Landmark>;
  delete(id: string, ownerId: string): Promise<void>;
}

export class LandmarkService implements ILandmarkService {
  constructor(
    private readonly repository: ILandmarkRepository,
    private readonly geocoder: ReverseGeocoder,
  ) {}

  getAll(ownerId: string): Promise<Landmark[]> {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: string, ownerId: string): Promise<Landmark> {
    const landmark = await this.repository.findByIdForOwner(id, ownerId);
    if (!landmark) throw new NotFoundError('Landmark not found');
    return landmark;
  }

  async create(dto: CreateLandmarkDto, ownerId: string): Promise<Landmark> {
    const addressLabel = await this.resolveAddressLabel(dto.position);
    return this.repository.create({
      ownerId,
      name: dto.name,
      description: dto.description,
      position: dto.position,
      iconUrl: dto.iconUrl,
      color: dto.color,
      addressLabel,
    });
  }

  async update(id: string, dto: UpdateLandmarkDto, ownerId: string): Promise<Landmark> {
    const data: UpdateLandmarkData = {
      name: dto.name,
      description: dto.description,
      position: dto.position,
      iconUrl: dto.iconUrl,
      color: dto.color,
    };
    // A landmark's stored address follows its position; only recompute when it moves.
    if (dto.position !== undefined) {
      data.addressLabel = await this.resolveAddressLabel(dto.position);
    }
    const updated = await this.repository.update(id, ownerId, data);
    if (!updated) throw new NotFoundError('Landmark not found');
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
    if (!deleted) throw new NotFoundError('Landmark not found');
  }
}
