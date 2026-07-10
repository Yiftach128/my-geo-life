import { Polygon } from '../domain/polygon.entity.js';
import { Point } from '../../shared/domain/point.js';
import { GeoStyle } from '../../shared/domain/geo-style.js';

/** Creation payload. `ownerId` comes from the JWT, never the request body. */
export interface CreatePolygonData {
  ownerId: string;
  name: string;
  description?: string;
  points: Point[];
  style: GeoStyle;
  addressLabel: string | null;
}

/** Partial update payload. Undefined fields are ignored. */
export interface UpdatePolygonData {
  name?: string;
  description?: string;
  points?: Point[];
  style?: GeoStyle;
  addressLabel?: string | null;
}

/**
 * Persistence abstraction (DIP seam). Every read/mutation is owner-scoped, so a
 * polygon that is missing OR owned by someone else looks identical (null/false).
 */
export interface IPolygonRepository {
  findAllByOwner(ownerId: string): Promise<Polygon[]>;
  findByIdForOwner(id: string, ownerId: string): Promise<Polygon | null>;
  create(data: CreatePolygonData): Promise<Polygon>;
  update(id: string, ownerId: string, data: UpdatePolygonData): Promise<Polygon | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}
