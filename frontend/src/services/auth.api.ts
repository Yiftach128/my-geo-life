import { apiFetch } from './api-client';
import type { AuthResponse, Address } from '../types/api';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address?: Address;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginPayload) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),
};
