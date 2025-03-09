import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { AuthContext } from '../types/auth';
import API from '../services/api';
import {
  getStoredUser,
  setStoredUser,
} from '../services/api/utils/localStorage';
import type { AuthUser } from '../types/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(getStoredUser());
  const isAuthenticated = !!user;
  const router = useRouter();
  const logout = React.useCallback(async () => {
    try {
      await API.invalidateRefreshToken();
    } catch (error) {
      console.error('Failed to invalidate refresh token', error);
    }
    setStoredUser(null);
    setUser(null);
    await router.invalidate();
  }, [router]);

  const login = React.useCallback(
    async (username: string, password: string) => {
      const result = await API.login(username, password);
      if (!result.data) {
        return;
      }
      const newUser: AuthUser = {
        id: result.data.id,
        username: result.data.username,
        jwt: result.data.token,
        refreshToken: result.data.refreshToken,
        refreshTokenExpires: result.data.refreshTokenExpires,
      };

      setStoredUser(newUser);
      setUser(newUser);
    },
    []
  );

  React.useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
