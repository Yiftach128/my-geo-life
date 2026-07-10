import {
  IPolygonRepository,
  CreatePolygonData,
  UpdatePolygonData,
} from '../../src/modules/geo/polygon/repository/polygon.repository.interface.js';
import { Polygon } from '../../src/modules/geo/polygon/domain/polygon.entity.js';

/** Owner-scoped test double for IPolygonRepository (see landmark helper). */
export class InMemoryPolygonRepository implements IPolygonRepository {
  private items: Polygon[] = [];
  private seq = 0;

  async findAllByOwner(ownerId: string): Promise<Polygon[]> {
    return this.items.filter((i) => i.ownerId === ownerId);
  }

  async findByIdForOwner(id: string, ownerId: string): Promise<Polygon | null> {
    return this.items.find((i) => i.id === id && i.ownerId === ownerId) ?? null;
  }

  async create(data: CreatePolygonData): Promise<Polygon> {
    const polygon = new Polygon({
      id: String(++this.seq),
      ownerId: data.ownerId,
      name: data.name,
      description: data.description,
      points: data.points,
      style: data.style,
      addressLabel: data.addressLabel,
      createdAt: new Date(),
    });
    this.items.push(polygon);
    return polygon;
  }

  async update(id: string, ownerId: string, data: UpdatePolygonData): Promise<Polygon | null> {
    const polygon = this.items.find((i) => i.id === id && i.ownerId === ownerId);
    if (!polygon) return null;
    if (data.name !== undefined) polygon.name = data.name;
    if (data.description !== undefined) polygon.description = data.description;
    if (data.points !== undefined) polygon.points = data.points;
    if (data.style !== undefined) polygon.style = data.style;
    if (data.addressLabel !== undefined) polygon.addressLabel = data.addressLabel;
    return polygon;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const idx = this.items.findIndex((i) => i.id === id && i.ownerId === ownerId);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
