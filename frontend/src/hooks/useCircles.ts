import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { circlesApi } from '../services/circles.api';
import { useAuth } from './useAuth';
import { ApiError } from '../services/api-client';
import type { CircleDto, CreateCirclePayload, UpdateCirclePayload } from '../types/api';

const KEY = ['circles'] as const;

export function useCircles() {
  const { isAuthenticated, logout } = useAuth();
  return useQuery({
    queryKey: KEY,
    queryFn: circlesApi.getAll,
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    throwOnError: (err) => {
      if (err instanceof ApiError && err.status === 401) { logout(); return false; }
      return false;
    },
  });
}

export function useCreateCircle() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: (data: CreateCirclePayload) => circlesApi.create(data),
    onSuccess: (item) => {
      qc.setQueryData<CircleDto[]>(KEY, (old = []) => [...old, item]);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}

export function useUpdateCircle() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCirclePayload }) =>
      circlesApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData<CircleDto[]>(KEY, (old = []) =>
        old.map((c) => (c.id === updated.id ? updated : c)),
      );
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}

export function useDeleteCircle() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: (id: string) => circlesApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData<CircleDto[]>(KEY, (old = []) => old.filter((c) => c.id !== id));
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    },
  });
}
