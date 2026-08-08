import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('motoluv_token');
    if (!token) { setLoading(false); return; }
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      localStorage.removeItem('motoluv_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('motoluv_token', res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem('motoluv_token', res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('motoluv_token');
    setUser(null);
  };

  const updateRole = async (role) => {
    const u = await authApi.updateRole(role);
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
