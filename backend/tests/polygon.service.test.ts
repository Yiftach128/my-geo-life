import { describe, it, expect, beforeEach } from 'vitest';
import { PolygonService } from '../src/modules/geo/polygon/polygon.service.js';
import {
  CreatePolygonDto,
  createPolygonSchema,
} from '../src/modules/geo/polygon/dto/create-polygon.dto.js';
import { UpdatePolygonDto } from '../src/modules/geo/polygon/dto/update-polygon.dto.js';
import { InMemoryPolygonRepository } from './helpers/in-memory-polygon.repository.js';
import { DEFAULT_GEO_STYLE } from '../src/modules/geo/shared/domain/geo-style.js';
import { NotFoundError } from '../src/shared/errors/index.js';

const OWNER_A = 'owner-a';
const OWNER_B = 'owner-b';
const TRIANGLE = [
  { lat: 0, lng: 0 },
  { lat: 1, lng: 0 },
  { lat: 1, lng: 1 },
];

describe('PolygonService', () => {
  let repo: InMemoryPolygonRepository;
  let service: PolygonService;

  beforeEach(() => {
    repo = new InMemoryPolygonRepository();
    service = new PolygonService(repo);
  });

  const create = (ownerId = OWNER_A) =>
    service.create(
      new CreatePolygonDto({ name: 'Area', points: TRIANGLE, style: DEFAULT_GEO_STYLE }),
      ownerId,
    );

  it('stamps ownerId and stores the vertices', async () => {
    const polygon = await create(OWNER_A);
    expect(polygon.ownerId).toBe(OWNER_A);
    expect(polygon.points).toHaveLength(3);
  });

  it('getAll is owner-scoped', async () => {
    await create(OWNER_A);
    await create(OWNER_B);
    expect(await service.getAll(OWNER_A)).toHaveLength(1);
  });

  it('hides another owner\'s polygon on read, update and delete', async () => {
    const polygon = await create(OWNER_A);
    await expect(service.getById(polygon.id, OWNER_B)).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      service.update(polygon.id, new UpdatePolygonDto({ name: 'x' }), OWNER_B),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.delete(polygon.id, OWNER_B)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('createPolygonSchema', () => {
  it('rejects a polygon with fewer than 3 points', () => {
    const result = createPolygonSchema.safeParse({
      name: 'Bad',
      points: [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects out-of-range coordinates', () => {
    const result = createPolygonSchema.safeParse({
      name: 'Bad',
      points: [
        { lat: 999, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid triangle and applies the default style', () => {
    const result = createPolygonSchema.safeParse({ name: 'Good', points: TRIANGLE });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.style.strokeColor).toBe('#3388ff');
    }
  });
});
