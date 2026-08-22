import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Auth Provider Helper for Supabase OAuth
export async function signInWithProvider(provider) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado aún. Por favor ingresa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tus variables de entorno.');
  }

  // Supabase supports 'google', 'apple' (for iCloud), 'facebook'
  const providerKey = provider === 'icloud' ? 'apple' : provider;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerKey,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Supabase Email Login/Register
export async function signUpWithEmail(email, password, metadata = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Función de prueba sencilla para verificar la conexión con Supabase.
 * Intenta recuperar un registro de una tabla e imprime en consola el resultado.
 *
 * @param {string} [tableName='motos'] - Nombre de la tabla a consultar
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
export async function testSupabaseConnection(tableName = 'motos') {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('⚠️ Supabase no está configurado en las variables de entorno (VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY).');
    return { success: false, error: 'Supabase client not configured' };
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Error al consultar la tabla '${tableName}' en Supabase:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ ¡Conexión con Supabase exitosa! Se consultó la tabla '${tableName}':`, {
      registrosRecuperados: data?.length || 0,
      primerRegistro: data?.[0] || 'Tabla vacía (conexión correcta)',
    });

    return { success: true, data };
  } catch (err) {
    console.error('❌ Ocurrió una excepción al conectar con Supabase:', err.message || err);
    return { success: false, error: err.message || err };
  }
}
