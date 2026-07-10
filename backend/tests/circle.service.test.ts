import { describe, it, expect, beforeEach } from 'vitest';
import { CircleService } from '../src/modules/geo/circle/circle.service.js';
import { CreateCircleDto } from '../src/modules/geo/circle/dto/create-circle.dto.js';
import { UpdateCircleDto } from '../src/modules/geo/circle/dto/update-circle.dto.js';
import { InMemoryCircleRepository } from './helpers/in-memory-circle.repository.js';
import { DEFAULT_GEO_STYLE } from '../src/modules/geo/shared/domain/geo-style.js';
import { NotFoundError } from '../src/shared/errors/index.js';
import { StubGeocoder, ThrowingGeocoder } from './helpers/stub-geocoder.js';

const OWNER_A = 'owner-a';
const OWNER_B = 'owner-b';

describe('CircleService', () => {
  let repo: InMemoryCircleRepository;
  let geocoder: StubGeocoder;
  let service: CircleService;

  beforeEach(() => {
    repo = new InMemoryCircleRepository();
    geocoder = new StubGeocoder('Somewhere, Country');
    service = new CircleService(repo, geocoder);
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

  it('stores the reverse-geocoded address label of the center on create', async () => {
    const circle = await create(OWNER_A);
    expect(circle.addressLabel).toBe('Somewhere, Country');
    expect(geocoder.calls).toEqual([{ lat: 32, lon: 34 }]);
  });

  it('still creates the circle with a null label when reverse geocoding fails', async () => {
    service = new CircleService(repo, new ThrowingGeocoder());
    const circle = await create(OWNER_A);
    expect(circle.addressLabel).toBeNull();
  });

  it('recomputes addressLabel when the center moves on update', async () => {
    const circle = await create(OWNER_A);
    geocoder = new StubGeocoder('Elsewhere, Country');
    service = new CircleService(repo, geocoder);
    const updated = await service.update(
      circle.id,
      new UpdateCircleDto({ center: { lat: 40, lng: -74 } }),
      OWNER_A,
    );
    expect(updated.addressLabel).toBe('Elsewhere, Country');
    expect(geocoder.calls).toEqual([{ lat: 40, lon: -74 }]);
  });

  it('leaves addressLabel untouched when the center is not part of the update', async () => {
    const circle = await create(OWNER_A);
    const updated = await service.update(circle.id, new UpdateCircleDto({ radius: 12 }), OWNER_A);
    expect(updated.addressLabel).toBe('Somewhere, Country');
  });
});
