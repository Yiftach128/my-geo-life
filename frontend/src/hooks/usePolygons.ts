import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { polygonsApi } from '../services/polygons.api';
import { useAuth } from './useAuth';
import { ApiError } from '../services/api-client';
import type { PolygonDto, CreatePolygonPayload, UpdatePolygonPayload } from '../types/api';

const KEY = ['polygons'] as const;

export function usePolygons() {
  const { isAuthenticated, logout } = useAuth();
  return useQuery({
    queryKey: KEY,
    queryFn: polygonsApi.getAll,
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    throwOnError: (err) => {
      if (err instanceof ApiError && err.status === 401) { logout(); return false; }
      return false;
    },
  });
}

export function useCreatePolygon() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: (data: CreatePolygonPayload) => polygonsApi.create(data),
    onSuccess: (item) => {
      qc.setQueryData<PolygonDto[]>(KEY, (old = []) => [...old, item]);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}

export function useUpdatePolygon() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePolygonPayload }) =>
      polygonsApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData<PolygonDto[]>(KEY, (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}

export function useDeletePolygon() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: (id: string) => polygonsApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData<PolygonDto[]>(KEY, (old = []) => old.filter((p) => p.id !== id));
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}
