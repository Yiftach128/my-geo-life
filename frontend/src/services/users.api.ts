import { apiFetch } from './api-client';
import type { UserDto, Address } from '../types/api';

interface UpdateProfilePayload {
  name?: string;
  address?: Address;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const usersApi = {
  update: (id: string, data: UpdateProfilePayload) =>
    apiFetch<UserDto>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  changePassword: (id: string, data: ChangePasswordPayload) =>
    apiFetch<void>(`/api/users/passwordchange/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
