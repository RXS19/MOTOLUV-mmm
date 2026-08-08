import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import { isSupabaseConfigured, signInWithProvider } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('vendedor'); // 'comprador' or 'vendedor'

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('motoluv_token');
    if (!token) { setLoading(false); return; }
    try {
      const u = await authApi.me();
      setUser(u);
      if (u.role === 'comprador') setActiveView('comprador');
      else if (u.role === 'vendedor' || u.role === 'both') setActiveView('vendedor');
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
    if (res.user.role === 'comprador') setActiveView('comprador');
    else setActiveView('vendedor');
    return res.user;
  };

  const loginWithOAuth = async (provider) => {
    // If Supabase is configured, trigger Supabase OAuth redirect/popup
    if (isSupabaseConfigured) {
      await signInWithProvider(provider);
      return;
    }

    // Demo/Backend OAuth simulation
    const simulatedEmail = `usuario.${provider}@motoluv.mx`;
    const simulatedName = `Usuario ${provider.toUpperCase()}`;
    const avatar = provider === 'google' 
      ? 'https://lh3.googleusercontent.com/a/default-user' 
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    const res = await authApi.oauth({
      provider,
      email: simulatedEmail,
      name: simulatedName,
      avatar,
    });

    localStorage.setItem('motoluv_token', res.access_token);
    setUser(res.user);
    setActiveView('vendedor');
    return res.user;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem('motoluv_token', res.access_token);
    setUser(res.user);
    if (data.role) setActiveView(data.role);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('motoluv_token');
    setUser(null);
  };

  const updateRole = async (role) => {
    const u = await authApi.updateRole(role);
    setUser(u);
    setActiveView(role === 'both' ? 'vendedor' : role);
    return u;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithOAuth,
      register,
      logout,
      updateRole,
      setUser,
      activeView,
      setActiveView,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
