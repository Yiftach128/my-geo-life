import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/auth.api';
import { usersApi } from '../services/users.api';
import { ApiError } from '../services/api-client';
import type { UserDto } from '../types/api';

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserDto, token: string) => void;
  updateUser: (user: UserDto) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): { user: UserDto | null; token: string | null } {
  try {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? (JSON.parse(userJson) as UserDto) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const initial = useMemo(() => loadFromStorage(), []);
  const [user, setUser] = useState<UserDto | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  const login = useCallback((newUser: UserDto, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', newToken);
  }, []);

  const updateUser = useCallback((nextUser: UserDto) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    queryClient.clear();
  }, [queryClient]);

  // On app load, refresh the profile from the server so `user` (and everything it drives —
  // the modal, the Home marker) isn't stale localStorage data. Runs once: `initial` is a
  // stable memo and updateUser/logout are stable callbacks. A 401 (expired token) logs out;
  // other failures keep the cached copy. Same id, so MapPage's sign-in fly-to won't re-fire.
  useEffect(() => {
    if (!initial.token || !initial.user) return;
    let cancelled = false;
    usersApi
      .getById(initial.user.id)
      .then((fresh) => {
        if (!cancelled) updateUser(fresh);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout();
      });
    return () => {
      cancelled = true;
    };
  }, [initial, updateUser, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: token !== null && user !== null,
      login,
      updateUser,
      logout,
    }),
    [user, token, login, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
