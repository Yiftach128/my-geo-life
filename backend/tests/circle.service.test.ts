import { describe, it, expect, beforeEach } from 'vitest';
import { CircleService } from '../src/modules/geo/circle/circle.service.js';
import { CreateCircleDto } from '../src/modules/geo/circle/dto/create-circle.dto.js';
import { UpdateCircleDto } from '../src/modules/geo/circle/dto/update-circle.dto.js';
import { InMemoryCircleRepository } from './helpers/in-memory-circle.repository.js';
import { DEFAULT_GEO_STYLE } from '../src/modules/geo/shared/domain/geo-style.js';
import { NotFoundError } from '../src/shared/errors/index.js';

const OWNER_A = 'owner-a';
const OWNER_B = 'owner-b';

describe('CircleService', () => {
  let repo: InMemoryCircleRepository;
  let service: CircleService;

  beforeEach(() => {
    repo = new InMemoryCircleRepository();
    service = new CircleService(repo);
  });

  const create = (ownerId = OWNER_A) =>
    service.create(
      new CreateCircleDto({
        name: 'Zone',
        center: { lat: 32, lng: 34 },
        radius: 500,
        style: DEFAULT_GEO_STYLE,
      }),
      ownerId,
    );

  it('stamps ownerId from the argument and stores the radius', async () => {
    const circle = await create(OWNER_A);
    expect(circle.ownerId).toBe(OWNER_A);
    expect(circle.radius).toBe(500);
  });

  it('getAll returns only the owner\'s circles', async () => {
    await create(OWNER_A);
    await create(OWNER_B);
    expect(await service.getAll(OWNER_A)).toHaveLength(1);
  });

  it('throws NotFoundError for a missing circle', async () => {
    await expect(service.getById('nope', OWNER_A)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('hides another owner\'s circle on read', async () => {
    const circle = await create(OWNER_A);
    await expect(service.getById(circle.id, OWNER_B)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('refuses to update or delete another owner\'s circle', async () => {
    const circle = await create(OWNER_A);
    await expect(
      service.update(circle.id, new UpdateCircleDto({ radius: 10 }), OWNER_B),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.delete(circle.id, OWNER_B)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates an owned circle', async () => {
    const circle = await create(OWNER_A);
    const updated = await service.update(circle.id, new UpdateCircleDto({ radius: 999 }), OWNER_A);
    expect(updated.radius).toBe(999);
  });
});
