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
 * Obtener o sincronizar el perfil de usuario de `public.profiles`.
 * Si el usuario existe en auth pero no en public.profiles, se intenta upsert inmediato.
 */
export async function fetchUserProfile(userId, userMetadata = null) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      logAuthDiagnostic('fetchUserProfile_error', {
        userId,
        errorCode: error.code,
        errorMessage: error.message,
        details: error.details,
      });
      console.error('[Supabase Profiles Error]', error.message, error.details || '');
    }

    if (profile) {
      logAuthDiagnostic('profile_encontrado', {
        userId: profile.id,
        hasPhone: Boolean(profile.phone),
        role: profile.role,
      });
      return profile;
    }

    // Si profile no existe aún, crearlo mediante upsert seguro
    if (userMetadata) {
      const fallbackPayload = {
        id: userId,
        full_name: userMetadata.full_name || userMetadata.name || '',
        phone: userMetadata.phone || userMetadata.phone_number || '',
        city: userMetadata.city || 'Ciudad de México',
        role: userMetadata.role || 'both',
        updated_at: new Date().toISOString(),
      };

      logAuthDiagnostic('profile_creando_por_fallback', { userId });

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert(fallbackPayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (!insertError && createdProfile) {
        logAuthDiagnostic('profile_creado', { userId: createdProfile.id });
        return createdProfile;
      }

      if (insertError) {
        logAuthDiagnostic('profile_creacion_error', {
          userId,
          errorCode: insertError.code,
          errorMessage: insertError.message,
        });
      }

      return fallbackPayload;
    }
  } catch (err) {
    console.error('Error al consultar tabla profiles en Supabase:', err?.message || err);
  }

  return null;
}

/**
 * Actualizar datos del perfil en `public.profiles` y metadata de Supabase Auth
 * Espera la respuesta de Supabase y no oculta errores silenciosamente.
 */
export async function updateUserProfile(userId, updates) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    throw new Error('Supabase no está configurado para actualizar el perfil.');
  }

  const cleanUpdates = { ...updates };
  // Sanitizar campos
  if (cleanUpdates.phone !== undefined) {
    cleanUpdates.phone = String(cleanUpdates.phone).trim();
  }

  let authMetaError = null;
  let dbProfileError = null;

  // 1. Actualizar metadata de auth en Supabase
  try {
    const { error: metaErr } = await supabase.auth.updateUser({
      data: cleanUpdates,
    });
    if (metaErr) {
      authMetaError = metaErr;
      logAuthDiagnostic('update_auth_metadata_error', {
        userId,
        message: metaErr.message,
        code: metaErr.code,
      });
    }
  } catch (err) {
    authMetaError = err;
  }

  // 2. Actualizar tabla public.profiles mediante upsert seguro
  try {
    const { data, error: tableErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (tableErr) {
      dbProfileError = tableErr;
      logAuthDiagnostic('update_profile_table_error', {
        userId,
        message: tableErr.message,
        code: tableErr.code,
        details: tableErr.details,
      });
      console.error('[Supabase Profile Update Error]', tableErr.message, tableErr.details || '');
    }

    if (data) {
      logAuthDiagnostic('profile_actualizado', {
        userId: data.id,
        updatedPhone: data.phone,
        role: data.role,
      });
      return data;
    }
  } catch (err) {
    dbProfileError = err;
    console.error('[Supabase Profile Update Exception]', err?.message || err);
  }

  // Si ambos fallaron o hubo un error crítico de base de datos/RLS, lanzarlo
  if (dbProfileError && authMetaError) {
    const err = new Error(dbProfileError.message || authMetaError.message || 'Error al actualizar perfil en Supabase');
    err.dbError = dbProfileError;
    err.authError = authMetaError;
    throw err;
  }

  return cleanUpdates;
}
