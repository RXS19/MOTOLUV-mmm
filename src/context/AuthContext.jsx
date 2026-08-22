import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import { isSupabaseConfigured, signInWithProvider, supabase } from '../lib/supabase';

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
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('motoluv_token', res.access_token);
      setUser(res.user);
      if (res.user.role === 'comprador') setActiveView('comprador');
      else setActiveView('vendedor');
      return res.user;
    } catch (err) {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password,
          });
          if (!supaErr && supaAuth?.user) {
            const fallbackUser = {
              id: supaAuth.user.id,
              email: supaAuth.user.email,
              name: supaAuth.user.user_metadata?.full_name || supaAuth.user.user_metadata?.name || email.split('@')[0],
              role: supaAuth.user.user_metadata?.role || 'both',
              city: supaAuth.user.user_metadata?.city || 'Ciudad de México',
              phone: supaAuth.user.user_metadata?.phone || '',
              rating: 5.0,
              operations: 1,
            };
            const token = supaAuth.session?.access_token || `token_${supaAuth.user.id}`;
            localStorage.setItem('motoluv_token', token);
            setUser(fallbackUser);
            if (fallbackUser.role === 'comprador') setActiveView('comprador');
            else setActiveView('vendedor');
            return fallbackUser;
          }
        } catch (supaEx) {
          console.warn('Direct Supabase login fallback failed:', supaEx);
        }
      }
      throw err;
    }
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
    try {
      const res = await authApi.register(data);
      localStorage.setItem('motoluv_token', res.access_token);
      setUser(res.user);
      if (data.role) setActiveView(data.role);
      return res.user;
    } catch (err) {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: supaAuth, error: supaErr } = await supabase.auth.signUp({
            email: data.email.trim().toLowerCase(),
            password: data.password,
            options: {
              data: {
                full_name: data.name,
                phone: data.phone || '',
                city: data.city || 'Ciudad de México',
                role: data.role || 'both',
              },
            },
          });
          if (!supaErr && supaAuth?.user) {
            const fallbackUser = {
              id: supaAuth.user.id,
              email: data.email,
              name: data.name,
              role: data.role || 'both',
              city: data.city || 'Ciudad de México',
              phone: data.phone || '',
              rating: 5.0,
              operations: 0,
            };
            const token = supaAuth.session?.access_token || `token_${supaAuth.user.id}`;
            localStorage.setItem('motoluv_token', token);
            setUser(fallbackUser);
            return fallbackUser;
          }
        } catch (supaEx) {
          console.warn('Direct Supabase register fallback failed:', supaEx);
        }
      }
      throw err;
    }
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
