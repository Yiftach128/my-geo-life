import { apiFetch } from './api-client';
import type { LandmarkDto, CreateLandmarkPayload, UpdateLandmarkPayload } from '../types/api';

export const landmarksApi = {
  getAll: () => apiFetch<LandmarkDto[]>('/api/geo/landmarks'),

  create: (data: CreateLandmarkPayload) =>
    apiFetch<LandmarkDto>('/api/geo/landmarks', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateLandmarkPayload) =>
    apiFetch<LandmarkDto>(`/api/geo/landmarks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/api/geo/landmarks/${id}`, { method: 'DELETE' }),
};
