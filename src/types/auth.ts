import React from 'react';

export type AuthUser = {
  id: number;
  username: string;
  jwt: string;
  expiryDate: Date;
  expiryEpoch: number;
  expiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiryDate: Date;
  refreshTokenExpiryEpoch: number;
  refreshTokenExpiresInSeconds: number;
  webSocketToken: string;
  webSocketTokenExpiryDate: Date;
  webSocketTokenExpiryEpoch: number;
  webSocketTokenExpiresInSeconds: number;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  update: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);
