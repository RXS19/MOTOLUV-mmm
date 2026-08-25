import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  signInWithProvider,
  formatSupabaseAuthError,
  fetchUserProfile,
  updateUserProfile,
  syncCurrentUser,
  logAuthDiagnostic,
} from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('vendedor'); // 'comprador' or 'vendedor'

  // Helper para construir el objeto de usuario estandarizado para toda la app
  const buildUserObject = useCallback(async (authUser, currentSession = null) => {
    if (!authUser) return null;

    const metadata = authUser.user_metadata || {};
    let profile = null;

    logAuthDiagnostic('buildUserObject_inicio', {
      userId: authUser.id,
      userEmail: authUser.email,
      hasSession: Boolean(currentSession),
    });

    if (isSupabaseConfigured && supabase) {
      try {
        profile = await fetchUserProfile(authUser.id, metadata);
      } catch (err) {
        logAuthDiagnostic('fetchUserProfile_exception', {
          userId: authUser.id,
          message: err?.message || String(err),
        });
      }
    }

    const fullName = profile?.full_name || metadata.full_name || metadata.name || (authUser.email ? authUser.email.split('@')[0] : 'Usuario');
    const role = profile?.role || metadata.role || 'both';
    const city = profile?.city || metadata.city || 'Ciudad de México';
    const phone = profile?.phone || metadata.phone || metadata.phone_number || metadata.phoneNumber || authUser.phone || metadata.custom_claims?.phone || '';
    const phoneUpdatedOnce = Boolean(profile?.phone_updated_once || metadata.phone_updated_once || (profile?.phone_change_count && profile.phone_change_count >= 1));
    const phoneChangeCount = profile?.phone_change_count ?? (phoneUpdatedOnce ? 1 : 0);
    const bankClabe = profile?.bank_clabe || metadata.bank_clabe || '';
    const bankName = profile?.bank_name || metadata.bank_name || '';
    const bankHolder = profile?.bank_holder || metadata.bank_holder || fullName;
    const bankUpdatedAt = profile?.bank_updated_at || metadata.bank_updated_at || null;

    return {
      id: authUser.id,
      email: authUser.email,
      name: fullName,
      phone,
      phone_updated_once: phoneUpdatedOnce,
      phone_change_count: phoneChangeCount,
      city,
      role,
      rating: profile?.rating ?? 5.0,
      operations: profile?.operations ?? 0,
      bank_clabe: bankClabe,
      bank_name: bankName,
      bank_holder: bankHolder,
      bank_updated_at: bankUpdatedAt,
      created_at: authUser.created_at || new Date().toISOString(),
      raw: authUser,
    };
  }, []);

  // Inicializar y escuchar cambios de sesión con Supabase Auth
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured || !supabase) {
        console.warn('Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error al obtener sesión inicial de Supabase:', error);
        }

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            // REQUISITO 3: Ejecutar sync_current_user() antes de construir el usuario
            await syncCurrentUser();
            const userObj = await buildUserObject(initialSession.user, initialSession);
            setUser(userObj);
            if (userObj?.role === 'comprador') setActiveView('comprador');
            else setActiveView('vendedor');
          } else {
            setSession(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Excepción al inicializar sesión:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Suscripción reactiva a cambios de autenticación (Login, Google OAuth, Logout, Token Refresh)
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        console.log(`[Supabase Auth Event: ${event}]`, {
          hasSession: Boolean(currentSession),
          userId: currentSession?.user?.id || null,
          userEmail: currentSession?.user?.email || null,
        });

        if (currentSession?.user) {
          setSession(currentSession);
          // REQUISITO 2: Ejecutar sync_current_user() cuando Supabase entrega la sesión (OAuth / Login / Refresh)
          await syncCurrentUser();
          const userObj = await buildUserObject(currentSession.user, currentSession);
          if (mounted) {
            setUser(userObj);
            if (userObj?.role === 'comprador') setActiveView('comprador');
            else setActiveView('vendedor');
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT' || (!currentSession && event !== 'INITIAL_SESSION')) {
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        }
      });
      subscription = authListener.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [buildUserObject]);

  // LOGIN: Directo con Supabase Auth
  const login = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase no está configurado. Revisa tus variables de entorno.');
    }

    const cleanEmail = email.trim().toLowerCase();

    console.log('--- [INTENTO DE LOGIN CON SUPABASE AUTH] ---');
    console.log('Email:', cleanEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error('=== [SUPABASE AUTH LOGIN ERROR] ===');
      console.error('error.message:', error.message);
      console.error('error.code:', error.code);
      console.error('error.status:', error.status);
      console.error('error.name:', error.name);
      console.error('===================================');

      const friendlyMessage = formatSupabaseAuthError(error);
      const customErr = new Error(friendlyMessage);
      customErr.original = error;
      customErr.code = error.code;
      customErr.status = error.status;
      throw customErr;
    }

    console.log('=== [SUPABASE AUTH LOGIN SUCCESS] ===');
    console.log('data.user.id (UUID):', data?.user?.id);
    console.log('data.user.email:', data?.user?.email);
    console.log('data.session exists:', Boolean(data?.session));
    console.log('=====================================');

    if (data?.session) {
      setSession(data.session);
      // REQUISITO 1: Ejecutar sync_current_user() al iniciar sesión
      await syncCurrentUser();
    }

    const userObj = await buildUserObject(data.user, data.session);
    setUser(userObj);
    if (userObj?.role === 'comprador') setActiveView('comprador');
    else setActiveView('vendedor');
    return userObj;
  };

  // REGISTRO: Directo con Supabase Auth
  const register = async ({ name, email, phone, city, password, role = 'both' }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase no está configurado. Revisa tus variables de entorno.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = (phone || '').trim();
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, '');
    const cleanCity = (city || 'Ciudad de México').trim();

    if (!cleanDigits || cleanDigits.length < 10) {
      throw new Error('El número de teléfono / WhatsApp es obligatorio y debe tener al menos 10 dígitos.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          name: cleanName,
          phone: cleanPhone,
          city: cleanCity,
          role: role || 'both',
        },
      },
    });

    if (error) {
      console.error('=== [SUPABASE AUTH ERROR EN SIGNUP] ===');
      console.error('error.message:', error.message);
      console.error('error.code:', error.code);
      console.error('error.status:', error.status);
      console.error('error.name:', error.name);
      console.error('error.details:', error.details);
      console.error('error.hint:', error.hint);
      console.error('======================================');

      const friendlyMessage = formatSupabaseAuthError(error);
      const customErr = new Error(friendlyMessage);
      customErr.original = error;
      customErr.code = error.code;
      customErr.status = error.status;
      throw customErr;
    }

    // REQUISITO 1:
    // Si existe sesión, ejecutar inmediatamente sync_current_user().
    // Si Supabase requiere confirmación de email y todavía no existe sesión, NO mostrar error.
    if (data?.session) {
      setSession(data.session);
      await syncCurrentUser();
    }

    const userObj = await buildUserObject(data.user, data.session);
    setUser(userObj);
    if (role === 'comprador') setActiveView('comprador');
    else setActiveView('vendedor');

    return {
      ...userObj,
      session: data.session,
      requiresEmailConfirmation: !data.session && !data.user?.confirmed_at,
    };
  };

  // OAUTH: Google, Apple / iCloud, Facebook
  const loginWithOAuth = async (provider) => {
    return await signInWithProvider(provider);
  };

  // LOGOUT: Directo con Supabase Auth
  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error al cerrar sesión en Supabase:', err);
    } finally {
      setSession(null);
      setUser(null);
    }
  };

  // REQUISITO 9 & 10: Actualizar datos de perfil (users y profiles, NUNCA register_users)
  const updateProfile = async ({ name, phone, city, bank_clabe, bank_name, bank_holder, role }) => {
    if (!user) throw new Error('Debes estar autenticado para actualizar tu perfil.');
    const updates = {};
    if (name !== undefined) {
      updates.full_name = name.trim();
    }
    const isPhoneChanging = phone !== undefined && user?.phone && phone.trim() !== user.phone.trim();

    if (phone !== undefined) {
      updates.phone = phone.trim();
      if (isPhoneChanging) {
        updates.phone_updated_once = true;
        updates.phone_change_count = (user?.phone_change_count || 0) + 1;
      }
    }
    if (city !== undefined) updates.city = city.trim();
    if (role !== undefined) updates.role = role;
    if (bank_clabe !== undefined) {
      updates.bank_clabe = bank_clabe.trim();
      updates.bank_updated_at = new Date().toISOString();
    }
    if (bank_name !== undefined) updates.bank_name = bank_name.trim();
    if (bank_holder !== undefined) updates.bank_holder = bank_holder.trim();

    try {
      await updateUserProfile(user.id, updates);
      logAuthDiagnostic('updateProfile_completado', { userId: user.id });
    } catch (err) {
      logAuthDiagnostic('updateProfile_error', {
        userId: user.id,
        message: err?.message || String(err),
      });
      console.error('[Error al actualizar perfil en Supabase]', err);
      throw err;
    }

    const updated = {
      ...user,
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(isPhoneChanging ? { phone_updated_once: true, phone_change_count: (user?.phone_change_count || 0) + 1 } : {}),
      ...(city !== undefined ? { city: city.trim() } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(bank_clabe !== undefined ? { bank_clabe: bank_clabe.trim(), bank_updated_at: updates.bank_updated_at } : {}),
      ...(bank_name !== undefined ? { bank_name: bank_name.trim() } : {}),
      ...(bank_holder !== undefined ? { bank_holder: bank_holder.trim() } : {}),
    };
    setUser(updated);
    if (role && role !== user.role) {
      setActiveView(role === 'both' ? 'vendedor' : role);
    }
    return updated;
  };

  // Cambiar rol (comprador/vendedor/both)
  const updateRole = async (newRole) => {
    if (!user) return null;
    await updateUserProfile(user.id, { role: newRole });
    const updated = { ...user, role: newRole };
    setUser(updated);
    setActiveView(newRole === 'both' ? 'vendedor' : newRole);
    return updated;
  };

  // Actualizar datos bancarios
  const updateBank = async ({ clabe, bank_name, holder }) => {
    if (!user) throw new Error('Debes estar autenticado para actualizar tus datos bancarios.');
    const updates = {
      bank_clabe: clabe ? clabe.trim() : '',
      bank_name: bank_name ? bank_name.trim() : '',
      bank_holder: holder ? holder.trim() : user.name,
      bank_updated_at: new Date().toISOString(),
    };
    await updateUserProfile(user.id, updates);
    const updated = { ...user, ...updates };
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        loginWithOAuth,
        register,
        logout,
        updateProfile,
        updateRole,
        updateBank,
        setUser,
        activeView,
        setActiveView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

