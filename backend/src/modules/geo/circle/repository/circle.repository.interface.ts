import { Circle } from '../domain/circle.entity.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

/** Creation payload. `ownerId` comes from the JWT, never the request body. */
export interface CreateCircleData {
  ownerId: string;
  name: string;
  description?: string;
  center: Point;
  radius: number;
  style: GeoStyle;
}

/** Partial update payload. Undefined fields are ignored. */
export interface UpdateCircleData {
  name?: string;
  description?: string;
  center?: Point;
  radius?: number;
  style?: GeoStyle;
}

/**
 * Persistence abstraction (DIP seam). Every read/mutation is owner-scoped, so a
 * circle that is missing OR owned by someone else looks identical (null/false).
 */
export interface ICircleRepository {
  findAllByOwner(ownerId: string): Promise<Circle[]>;
  findByIdForOwner(id: string, ownerId: string): Promise<Circle | null>;
  create(data: CreateCircleData): Promise<Circle>;
  update(id: string, ownerId: string, data: UpdateCircleData): Promise<Circle | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}
