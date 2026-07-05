import { describe, it, expect, beforeEach } from 'vitest';
import { LandmarkService } from '../src/modules/geo/landmark/landmark.service.js';
import { CreateLandmarkDto } from '../src/modules/geo/landmark/dto/create-landmark.dto.js';
import { UpdateLandmarkDto } from '../src/modules/geo/landmark/dto/update-landmark.dto.js';
import { InMemoryLandmarkRepository } from './helpers/in-memory-landmark.repository.js';
import { NotFoundError } from '../src/shared/errors/index.js';

const OWNER_A = 'owner-a';
const OWNER_B = 'owner-b';

describe('LandmarkService', () => {
  let repo: InMemoryLandmarkRepository;
  let service: LandmarkService;

  beforeEach(() => {
    repo = new InMemoryLandmarkRepository();
    service = new LandmarkService(repo);
  });

  const create = (ownerId = OWNER_A) =>
    service.create(
      new CreateLandmarkDto({ name: 'HQ', position: { lat: 32.08, lng: 34.78 }, color: '#3388ff' }),
      ownerId,
    );

  it('stamps ownerId from the argument, not the DTO', async () => {
    const landmark = await create(OWNER_A);
    expect(landmark.ownerId).toBe(OWNER_A);
  });

  it('getAll returns only the owner\'s landmarks', async () => {
    await create(OWNER_A);
    await create(OWNER_B);
    const mine = await service.getAll(OWNER_A);
    expect(mine).toHaveLength(1);
    expect(mine[0].ownerId).toBe(OWNER_A);
  });

  it('throws NotFoundError when getting a missing landmark', async () => {
    await expect(service.getById('nope', OWNER_A)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('hides another owner\'s landmark on read', async () => {
    const landmark = await create(OWNER_A);
    await expect(service.getById(landmark.id, OWNER_B)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('refuses to update another owner\'s landmark', async () => {
    const landmark = await create(OWNER_A);
    await expect(
      service.update(landmark.id, new UpdateLandmarkDto({ name: 'Renamed' }), OWNER_B),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('refuses to delete another owner\'s landmark', async () => {
    const landmark = await create(OWNER_A);
    await expect(service.delete(landmark.id, OWNER_B)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates an owned landmark', async () => {
    const landmark = await create(OWNER_A);
    const updated = await service.update(
      landmark.id,
      new UpdateLandmarkDto({ name: 'New Name' }),
      OWNER_A,
    );
    expect(updated.name).toBe('New Name');
  });

  it('deletes an owned landmark', async () => {
    const landmark = await create(OWNER_A);
    await service.delete(landmark.id, OWNER_A);
    await expect(service.getById(landmark.id, OWNER_A)).rejects.toBeInstanceOf(NotFoundError);
  });
});
