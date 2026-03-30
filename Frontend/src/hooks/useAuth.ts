import { useState } from 'react';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('avelarai_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('avelarai_token')
  );

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('avelarai_token', newToken);
    localStorage.setItem('avelarai_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('avelarai_token');
    localStorage.removeItem('avelarai_user');
    setToken(null);
    setUser(null);
  };

  return { user, token, login, logout, isAuthenticated: !!token };
};