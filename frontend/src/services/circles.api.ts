import { apiFetch } from './api-client';
import type { CircleDto, CreateCirclePayload, UpdateCirclePayload } from '../types/api';

export const circlesApi = {
  getAll: () => apiFetch<CircleDto[]>('/api/geo/circles'),

  create: (data: CreateCirclePayload) =>
    apiFetch<CircleDto>('/api/geo/circles', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateCirclePayload) =>
    apiFetch<CircleDto>(`/api/geo/circles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/api/geo/circles/${id}`, { method: 'DELETE' }),
};
