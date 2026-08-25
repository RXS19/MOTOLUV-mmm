import { createClient } from '@supabase/supabase-js';

// Sanitize URL to avoid duplicate slashes or appended /rest/v1
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Traduce y formatea los errores habituales de Supabase Auth a mensajes claros en español.
 */
export function formatSupabaseAuthError(err) {
  if (!err) return 'Ocurrió un error inesperado.';
  const msg = (err.message || String(err)).toLowerCase();

  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
    return 'Este correo electrónico ya está registrado. Por favor inicia sesión con tu contraseña.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
    return 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password') || msg.includes('password is too short')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('email not confirmed') || msg.includes('not verified')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return 'Límite de solicitudes alcanzado. Por favor espera unos minutos antes de intentar de nuevo.';
  }
  if (msg.includes('database error') || msg.includes('error saving new user')) {
    return 'Ocurrió un error al procesar el registro de usuario. Por favor intenta más tarde.';
  }
  if (msg.includes('invalid path') || msg.includes('request url')) {
    return 'Error en la conexión con el servidor. Verifica tu red.';
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email') || msg.includes('email address')) {
    return 'El formato de correo electrónico no es válido.';
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
    return 'No fue posible conectar con el servicio de autenticación. Revisa tu conexión a internet.';
  }

  return err.message || 'Error en la autenticación. Intenta nuevamente.';
}

/**
 * Iniciar sesión con proveedores OAuth (Google, Apple/iCloud, Facebook)
 */
export async function signInWithProvider(provider) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tus variables de entorno.');
  }

  const providerKey = provider === 'icloud' ? 'apple' : provider;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerKey,
    options: {
      redirectTo: `${window.location.origin}/panel`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Diagnostic logger for Supabase user and profile lifecycle
 * Strict security: Never logs tokens, passwords or secrets
 */
export function logAuthDiagnostic(action, details = {}) {
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    const safeDetails = { ...details };
    // Explicitly delete any sensitive key if passed accidentally
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
    delete safeDetails.password;
    delete safeDetails.anon_key;
    delete safeDetails.service_role;
    console.log(`[MOTOLUV AUTH DIAGNOSTIC: ${action}]`, safeDetails);
  }
}

/**
 * Ejecutar la función RPC `public.sync_current_user()` en Supabase.
 * Asegura los registros en:
 *  - register_users (inmutable con ON CONFLICT DO NOTHING)
 *  - users (datos actuales)
 *  - profiles (perfil del dashboard)
 */
export async function syncCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase.rpc('sync_current_user');

    if (error) {
      logAuthDiagnostic('sync_current_user_error', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      console.error('[Supabase RPC sync_current_user Error]', error.message, error.details || '');
      return { success: false, error };
    }

    logAuthDiagnostic('sync_current_user_success', { result: data });
    return { success: true, data };
  } catch (err) {
    logAuthDiagnostic('sync_current_user_exception', {
      message: err?.message || String(err),
    });
    console.error('[Supabase RPC sync_current_user Exception]', err?.message || err);
    return { success: false, error: err };
  }
}

/**
 * Obtener perfil de usuario desde `public.profiles` y `public.users`.
 */
export async function fetchUserProfile(userId, userMetadata = null) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;

  try {
    // 1. Consultar tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      logAuthDiagnostic('fetch_profile_error', {
        userId,
        errorCode: profileError.code,
        errorMessage: profileError.message,
        details: profileError.details,
      });
      console.error('[Supabase Profiles Error]', profileError.message, profileError.details || '');
    }

    // 2. Consultar tabla users para datos complementarios
    let userData = null;
    try {
      const { data: uData, error: uError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!uError && uData) {
        userData = uData;
      }
    } catch {
      // Ignorar si tabla users aún está vacía
    }

    if (profile || userData) {
      const fullName = profile?.full_name || userData?.full_name || userMetadata?.full_name || userMetadata?.name || '';
      const phone = profile?.phone || userData?.phone || userMetadata?.phone || userMetadata?.phone_number || '';
      const city = profile?.city || userData?.city || userMetadata?.city || 'Ciudad de México';
      const role = profile?.role || userData?.role || userMetadata?.role || 'both';

      const merged = {
        id: userId,
        full_name: fullName,
        phone,
        phone_updated_once: Boolean(profile?.phone_updated_once ?? userData?.phone_updated_once),
        phone_change_count: profile?.phone_change_count ?? userData?.phone_change_count ?? 0,
        city,
        role,
        bank_clabe: profile?.bank_clabe || userData?.bank_clabe || '',
        bank_name: profile?.bank_name || userData?.bank_name || '',
        bank_holder: profile?.bank_holder || userData?.bank_holder || fullName,
        bank_updated_at: profile?.bank_updated_at || userData?.bank_updated_at || null,
        rating: profile?.rating ?? 5.0,
        operations: profile?.operations ?? 0,
        created_at: profile?.created_at || userData?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || userData?.updated_at || new Date().toISOString(),
      };

      logAuthDiagnostic('profile_encontrado', {
        userId: merged.id,
        hasPhone: Boolean(merged.phone),
        role: merged.role,
      });
      return merged;
    }

    // Si profile no existe aún en tablas, estructurar fallback desde metadata
    if (userMetadata) {
      const fallbackPayload = {
        id: userId,
        full_name: userMetadata.full_name || userMetadata.name || '',
        phone: userMetadata.phone || userMetadata.phone_number || '',
        phone_updated_once: Boolean(userMetadata.phone_updated_once),
        phone_change_count: userMetadata.phone_change_count || 0,
        city: userMetadata.city || 'Ciudad de México',
        role: userMetadata.role || 'both',
        bank_clabe: userMetadata.bank_clabe || '',
        bank_name: userMetadata.bank_name || '',
        bank_holder: userMetadata.bank_holder || userMetadata.full_name || userMetadata.name || '',
        bank_updated_at: userMetadata.bank_updated_at || null,
        rating: 5.0,
        operations: 0,
        updated_at: new Date().toISOString(),
      };

      return fallbackPayload;
    }
  } catch (err) {
    console.error('Error al consultar tabla profiles en Supabase:', err?.message || err);
  }

  return null;
}

/**
 * Actualizar datos del usuario:
 * - NO enviar "name" a public.profiles ni public.users (la columna es "full_name").
 * - Mapear name -> full_name.
 * - Mantener: phone, phone_updated_once, phone_change_count, city, role, bank_clabe, bank_name, bank_holder, bank_updated_at.
 * - Actualizar public.users.
 * - Actualizar public.profiles.
 * - Actualizar metadata de Supabase Auth.
 * - NUNCA modificar public.register_users (inmutable).
 */
export async function updateUserProfile(userId, updates) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    throw new Error('Supabase no está configurado para actualizar el perfil.');
  }

  // 1. Extraer y mapear valores estrictos para evitar enviar columnas inexistentes (como "name")
  const resolvedFullName = updates.full_name !== undefined
    ? String(updates.full_name).trim()
    : updates.name !== undefined
    ? String(updates.name).trim()
    : undefined;

  const cleanData = {};

  if (resolvedFullName !== undefined) cleanData.full_name = resolvedFullName;
  if (updates.phone !== undefined) cleanData.phone = String(updates.phone).trim();
  if (updates.phone_updated_once !== undefined) cleanData.phone_updated_once = Boolean(updates.phone_updated_once);
  if (updates.phone_change_count !== undefined) cleanData.phone_change_count = Number(updates.phone_change_count);
  if (updates.city !== undefined) cleanData.city = String(updates.city).trim();
  if (updates.role !== undefined) cleanData.role = updates.role;
  if (updates.bank_clabe !== undefined) cleanData.bank_clabe = String(updates.bank_clabe).trim();
  if (updates.bank_name !== undefined) cleanData.bank_name = String(updates.bank_name).trim();
  if (updates.bank_holder !== undefined) cleanData.bank_holder = String(updates.bank_holder).trim();
  if (updates.bank_updated_at !== undefined) cleanData.bank_updated_at = updates.bank_updated_at;
  cleanData.updated_at = new Date().toISOString();

  let authMetaError = null;
  let usersTableError = null;
  let profilesTableError = null;

  // A. Actualizar metadata de auth en Supabase
  try {
    const authMetaPayload = { ...cleanData };
    if (resolvedFullName !== undefined) {
      authMetaPayload.name = resolvedFullName;
    }
    const { error: metaErr } = await supabase.auth.updateUser({
      data: authMetaPayload,
    });
    if (metaErr) {
      authMetaError = metaErr;
      logAuthDiagnostic('update_auth_metadata_error', {
        userId,
        message: metaErr.message,
        code: metaErr.code,
      });
      console.error('[Supabase Auth Metadata Error]', metaErr.message);
    }
  } catch (err) {
    authMetaError = err;
    console.error('[Supabase Auth Metadata Exception]', err);
  }

  // B. Actualizar public.users (NO register_users)
  try {
    const { error: uErr } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...cleanData,
      }, { onConflict: 'id' });

    if (uErr) {
      usersTableError = uErr;
      logAuthDiagnostic('update_users_table_error', {
        userId,
        message: uErr.message,
        code: uErr.code,
        details: uErr.details,
      });
      console.error('[Supabase Users Table Error]', uErr.message, uErr.details || '');
    }
  } catch (err) {
    usersTableError = err;
    console.error('[Supabase Users Table Exception]', err);
  }

  // C. Actualizar public.profiles (NO register_users)
  try {
    const { data: profileResult, error: pErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...cleanData,
      }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (pErr) {
      profilesTableError = pErr;
      logAuthDiagnostic('update_profiles_table_error', {
        userId,
        message: pErr.message,
        code: pErr.code,
        details: pErr.details,
      });
      console.error('[Supabase Profiles Table Error]', pErr.message, pErr.details || '');
    }

    if (profileResult) {
      logAuthDiagnostic('profile_actualizado', {
        userId: profileResult.id,
        updatedPhone: profileResult.phone,
        role: profileResult.role,
      });
    }
  } catch (err) {
    profilesTableError = err;
    console.error('[Supabase Profiles Table Exception]', err);
  }

  // Si fallaron tanto users como profiles, lanzar error real
  if (usersTableError && profilesTableError) {
    const err = new Error(profilesTableError.message || usersTableError.message || 'Error al actualizar perfil en Supabase');
    err.profilesError = profilesTableError;
    err.usersError = usersTableError;
    err.authError = authMetaError;
    throw err;
  }

  return cleanData;
}
