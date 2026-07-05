import { apiFetch } from './api-client';
import type { PolygonDto, CreatePolygonPayload, UpdatePolygonPayload } from '../types/api';

export const polygonsApi = {
  getAll: () => apiFetch<PolygonDto[]>('/api/geo/polygons'),

  create: (data: CreatePolygonPayload) =>
    apiFetch<PolygonDto>('/api/geo/polygons', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdatePolygonPayload) =>
    apiFetch<PolygonDto>(`/api/geo/polygons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/api/geo/polygons/${id}`, { method: 'DELETE' }),
};
