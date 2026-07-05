import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { landmarksApi } from '../services/landmarks.api';
import { useAuth } from './useAuth';
import { ApiError } from '../services/api-client';
import type { LandmarkDto, UpdateLandmarkPayload, CreateLandmarkPayload } from '../types/api';

const KEY = ['landmarks'] as const;

export function useLandmarks() {
  const { isAuthenticated, logout } = useAuth();
  return useQuery({
    queryKey: KEY,
    queryFn: landmarksApi.getAll,
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    throwOnError: (err) => {
      if (err instanceof ApiError && err.status === 401) { logout(); return false; }
      return false;
    },
  });
}

export function useCreateLandmark() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: (data: CreateLandmarkPayload) => landmarksApi.create(data),
    onSuccess: (item) => {
      qc.setQueryData<LandmarkDto[]>(KEY, (old = []) => [...old, item]);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}

export function useUpdateLandmark() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLandmarkPayload }) =>
      landmarksApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData<LandmarkDto[]>(KEY, (old = []) =>
        old.map((l) => (l.id === updated.id ? updated : l)),
      );
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}

export function useDeleteLandmark() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: (id: string) => landmarksApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData<LandmarkDto[]>(KEY, (old = []) => old.filter((l) => l.id !== id));
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}
