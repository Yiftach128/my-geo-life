import { Landmark } from '../domain/landmark.entity.js';
import { Point } from '../../shared/domain/point.js';

/** Creation payload. `ownerId` comes from the JWT, never the request body. */
export interface CreateLandmarkData {
  ownerId: string;
  name: string;
  description?: string;
  position: Point;
  iconUrl?: string;
  color: string;
}

/** Partial update payload. Undefined fields are ignored. */
export interface UpdateLandmarkData {
  name?: string;
  description?: string;
  position?: Point;
  iconUrl?: string;
  color?: string;
}

/**
 * Persistence abstraction (DIP seam). Every read/mutation is owner-scoped, so a
 * landmark that is missing OR owned by someone else looks identical (null/false)
 * — the service turns that into a uniform 404, leaking no existence.
 */
export interface ILandmarkRepository {
  findAllByOwner(ownerId: string): Promise<Landmark[]>;
  findByIdForOwner(id: string, ownerId: string): Promise<Landmark | null>;
  create(data: CreateLandmarkData): Promise<Landmark>;
  update(id: string, ownerId: string, data: UpdateLandmarkData): Promise<Landmark | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}
