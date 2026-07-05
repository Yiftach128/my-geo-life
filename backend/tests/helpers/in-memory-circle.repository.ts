import {
  ICircleRepository,
  CreateCircleData,
  UpdateCircleData,
} from '../../src/modules/geo/circle/repository/circle.repository.interface.js';
import { Circle } from '../../src/modules/geo/circle/domain/circle.entity.js';

/** Owner-scoped test double for ICircleRepository (see landmark helper). */
export class InMemoryCircleRepository implements ICircleRepository {
  private items: Circle[] = [];
  private seq = 0;

  async findAllByOwner(ownerId: string): Promise<Circle[]> {
    return this.items.filter((i) => i.ownerId === ownerId);
  }

  async findByIdForOwner(id: string, ownerId: string): Promise<Circle | null> {
    return this.items.find((i) => i.id === id && i.ownerId === ownerId) ?? null;
  }

  async create(data: CreateCircleData): Promise<Circle> {
    const circle = new Circle({
      id: String(++this.seq),
      ownerId: data.ownerId,
      name: data.name,
      description: data.description,
      center: data.center,
      radius: data.radius,
      style: data.style,
      createdAt: new Date(),
    });
    this.items.push(circle);
    return circle;
  }

  async update(id: string, ownerId: string, data: UpdateCircleData): Promise<Circle | null> {
    const circle = this.items.find((i) => i.id === id && i.ownerId === ownerId);
    if (!circle) return null;
    if (data.name !== undefined) circle.name = data.name;
    if (data.description !== undefined) circle.description = data.description;
    if (data.center !== undefined) circle.center = data.center;
    if (data.radius !== undefined) circle.radius = data.radius;
    if (data.style !== undefined) circle.style = data.style;
    return circle;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const idx = this.items.findIndex((i) => i.id === id && i.ownerId === ownerId);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
