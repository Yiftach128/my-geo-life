import {
  ILandmarkRepository,
  CreateLandmarkData,
  UpdateLandmarkData,
} from '../../src/modules/geo/landmark/repository/landmark.repository.interface.js';
import { Landmark } from '../../src/modules/geo/landmark/domain/landmark.entity.js';

/**
 * Owner-scoped test double for ILandmarkRepository. Every lookup filters on
 * ownerId, mirroring the Mongoose repo's `{ _id, owner }` queries — so the
 * per-user isolation tests exercise the real contract, not a laxer fake.
 */
export class InMemoryLandmarkRepository implements ILandmarkRepository {
  private items: Landmark[] = [];
  private seq = 0;

  async findAllByOwner(ownerId: string): Promise<Landmark[]> {
    return this.items.filter((i) => i.ownerId === ownerId);
  }

  async findByIdForOwner(id: string, ownerId: string): Promise<Landmark | null> {
    return this.items.find((i) => i.id === id && i.ownerId === ownerId) ?? null;
  }

  async create(data: CreateLandmarkData): Promise<Landmark> {
    const landmark = new Landmark({
      id: String(++this.seq),
      ownerId: data.ownerId,
      name: data.name,
      description: data.description,
      position: data.position,
      iconUrl: data.iconUrl,
      color: data.color,
      addressLabel: data.addressLabel,
      createdAt: new Date(),
    });
    this.items.push(landmark);
    return landmark;
  }

  async update(
    id: string,
    ownerId: string,
    data: UpdateLandmarkData,
  ): Promise<Landmark | null> {
    const landmark = this.items.find((i) => i.id === id && i.ownerId === ownerId);
    if (!landmark) return null;
    if (data.name !== undefined) landmark.name = data.name;
    if (data.description !== undefined) landmark.description = data.description;
    if (data.position !== undefined) landmark.position = data.position;
    if (data.iconUrl !== undefined) landmark.iconUrl = data.iconUrl;
    if (data.color !== undefined) landmark.color = data.color;
    if (data.addressLabel !== undefined) landmark.addressLabel = data.addressLabel;
    return landmark;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const idx = this.items.findIndex((i) => i.id === id && i.ownerId === ownerId);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
