import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/auth.api';
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
