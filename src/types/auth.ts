import React from 'react';

export type AuthUser = {
  id: number;
  username: string;
  jwt: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);
