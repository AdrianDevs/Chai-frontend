import React from 'react';
import { AuthContext } from '../types/auth';
import API from '../services/api';
import { clearJwtToken, setJwtToken } from '../services/api/utils/jwtToken';
import type { AuthUser } from '../types/auth';

const key = 'chai.auth.user';

function getStoredUser() {
  const user = localStorage.getItem(key);
  return user ? (JSON.parse(user) as AuthUser) : null;
}

function setStoredUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(key, JSON.stringify(user));
  } else {
    localStorage.removeItem(key);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(getStoredUser());
  const isAuthenticated = !!user;

  const logout = React.useCallback(() => {
    setStoredUser(null);
    setUser(null);
    clearJwtToken();
  }, []);

  const login = React.useCallback(
    async (username: string, password: string) => {
      const result = await API.login(username, password);
      console.log('AuthProvider login result', result);
      if (!result.data) {
        return;
      }
      const newUser: AuthUser = {
        id: result.data.id,
        username: result.data.username,
        jwt: result.data.token,
      };

      setStoredUser(newUser);
      setUser(newUser);
      setJwtToken(newUser.jwt);
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
