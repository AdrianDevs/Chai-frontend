import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { AuthContext } from '../types/auth';
import API from '../services/api';
import {
  getStoredUser,
  setStoredUser,
  updateStoredUser,
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
        jwt: result.data.jwt,
        expiryDate: result.data.expiryDate,
        expiryEpoch: result.data.expiryEpoch,
        expiresInSeconds: result.data.expiresInSeconds,
        refreshToken: result.data.refreshToken,
        refreshTokenExpiryDate: result.data.refreshTokenExpiryDate,
        refreshTokenExpiryEpoch: result.data.refreshTokenExpiryEpoch,
        refreshTokenExpiresInSeconds: result.data.refreshTokenExpiresInSeconds,
        webSocketToken: result.data.webSocketToken,
        webSocketTokenExpiryDate: result.data.webSocketTokenExpiryDate,
        webSocketTokenExpiryEpoch: result.data.webSocketTokenExpiryEpoch,
        webSocketTokenExpiresInSeconds:
          result.data.webSocketTokenExpiresInSeconds,
      };

      setStoredUser(newUser);
      setUser(newUser);
    },
    []
  );

  const update = React.useCallback(async () => {
    console.log('[AuthProvider] update');
    if (!user) {
      return;
    }
    const newTokensResponse = await API.refreshTokens(user.id);
    if (!newTokensResponse.data) {
      return;
    }
    updateStoredUser(newTokensResponse.data);
    setUser({ ...user, ...newTokensResponse.data } as AuthUser);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, update }}
    >
      {children}
    </AuthContext.Provider>
  );
}
