import axios from 'axios';
import { resolveSafeImageUrl, FALLBACK_MOTO_IMAGE } from '../utils/imageFallback';
import { motos as fallbackMotos } from '../mock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
export const API = `${BACKEND_URL}/api`;

// Helper: resolve relative image URLs (e.g. /uploads/xxx.jpg) with backend host and safe fallbacks
export const resolveImageUrl = (url, fallbackType = 'moto') => resolveSafeImageUrl(url, fallbackType);

const api = axios.create({ baseURL: API, timeout: 8000 });

api.interceptors.request.use(async (config) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

function getFallbackMotos(params = {}) {
  let list = [...fallbackMotos];
  if (params.brand && params.brand !== 'all') list = list.filter((m) => m.brand === params.brand);
  if (params.category && params.category !== 'all') list = list.filter((m) => m.category === params.category);
  if (params.city && params.city !== 'all') list = list.filter((m) => m.city === params.city);
  if (params.featured !== undefined) list = list.filter((m) => m.featured === (params.featured === 'true' || params.featured === true));
  if (params.q) {
    const qStr = String(params.q).toLowerCase();
    list = list.filter((m) => `${m.brand} ${m.model}`.toLowerCase().includes(qStr));
  }
  const max = params.limit ? parseInt(String(params.limit), 10) : 100;
  return list.slice(0, max);
}

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  oauth: (data) => api.post('/auth/oauth', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateRole: (role) => api.patch('/auth/role', { role }).then((r) => r.data),
  updateBank: (data) => api.patch('/auth/bank', data).then((r) => r.data),
};

export const motoApi = {
  list: async (params = {}) => {
    try {
      const res = await api.get('/motos', { params });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.filter((m) => m.status !== 'En revisión' && m.status !== 'revision' && m.status !== 'pending');
      }
      return getFallbackMotos(params).filter((m) => m.status !== 'En revisión');
    } catch {
      return getFallbackMotos(params).filter((m) => m.status !== 'En revisión');
    }
  },
  get: async (id) => {
    try {
      const res = await api.get(`/motos/${id}`);
      if (res.data && res.data.id) {
        return res.data;
      }
      const localMotos = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
      const foundLocal = localMotos.find((m) => m.id === id);
      if (foundLocal) return foundLocal;
      const found = fallbackMotos.find((m) => m.id === id);
      if (found) return found;
      return fallbackMotos[0];
    } catch {
      const localMotos = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
      const foundLocal = localMotos.find((m) => m.id === id);
      if (foundLocal) return foundLocal;
      const found = fallbackMotos.find((m) => m.id === id);
      if (found) return found;
      return fallbackMotos[0];
    }
  },
  create: async (data) => {
    try {
      const res = await api.post('/motos', data);
      if (res.data) {
        // Save local backup
        const existing = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
        localStorage.setItem('motoluv_custom_motos', JSON.stringify([res.data, ...existing]));
        return res.data;
      }
    } catch (apiErr) {
      console.warn('Backend /motos failed, attempting direct storage/fallback:', apiErr?.message);
      // Construct fallback moto record
      const defaultImg = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800';
      const imgs = data.images && data.images.length > 0 ? data.images : [defaultImg];
      const fallbackRecord = {
        id: `moto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        brand: data.brand || 'Motocicleta',
        model: data.model || '',
        year: Number(data.year) || 2024,
        km: Number(data.km) || 0,
        color: data.color || '',
        engine: data.engine || '',
        category: data.category || 'Naked',
        city: data.city || 'Ciudad de México',
        price: Number(data.price) || 0,
        description: data.description || '',
        images: imgs,
        image: imgs[0],
        score: 4.8,
        rating: 5,
        views: 1,
        featured: false,
        status: 'En revisión',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            fallbackRecord.owner_id = session.user.id;
            fallbackRecord.owner_name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Vendedor';
          }
          await supabase.from('motos').insert([{
            id: fallbackRecord.id,
            title: `${fallbackRecord.brand} ${fallbackRecord.model} ${fallbackRecord.year}`,
            brand: fallbackRecord.brand,
            model: fallbackRecord.model,
            year: fallbackRecord.year,
            price: fallbackRecord.price,
            km: fallbackRecord.km,
            engine: fallbackRecord.engine,
            category: fallbackRecord.category,
            location: fallbackRecord.city,
            description: fallbackRecord.description,
            images: fallbackRecord.images,
            owner_id: fallbackRecord.owner_id,
            status: fallbackRecord.status,
            created_at: fallbackRecord.created_at,
          }]);
        } catch (supaErr) {
          console.warn('Supabase direct insert error:', supaErr);
        }
      }

      const existing = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
      localStorage.setItem('motoluv_custom_motos', JSON.stringify([fallbackRecord, ...existing]));
      return fallbackRecord;
    }
  },
  update: async (id, data) => {
    try {
      const res = await api.patch(`/motos/${id}`, data);
      if (data.status === 'Rechazada' || data.status === 'rejected') {
        const existing = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
        localStorage.setItem('motoluv_custom_motos', JSON.stringify(existing.filter((m) => m.id !== id)));
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('motos').delete().eq('id', id);
          } catch {}
        }
      }
      return res.data;
    } catch (err) {
      if (data.status === 'Rechazada' || data.status === 'rejected') {
        const existing = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
        localStorage.setItem('motoluv_custom_motos', JSON.stringify(existing.filter((m) => m.id !== id)));
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('motos').delete().eq('id', id);
          } catch {}
        }
        return { deleted: true, status: 'Rechazada' };
      }
      throw err;
    }
  },
  remove: async (id) => {
    try {
      const res = await api.delete(`/motos/${id}`);
      const existing = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
      localStorage.setItem('motoluv_custom_motos', JSON.stringify(existing.filter((m) => m.id !== id)));
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('motos').delete().eq('id', id);
        } catch {}
      }
      return res.data;
    } catch (err) {
      if (err?.response?.status === 400 || err?.response?.data?.detail) {
        throw new Error(err.response.data.detail || 'No se puede eliminar la publicación');
      }
      const existing = JSON.parse(localStorage.getItem('motoluv_custom_motos') || '[]');
      localStorage.setItem('motoluv_custom_motos', JSON.stringify(existing.filter((m) => m.id !== id)));
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('motos').delete().eq('id', id);
        } catch {}
      }
      return { ok: true };
    }
  },
  mine: async () => {
    try {
      const res = await api.get('/my/motos');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data, error } = await supabase
              .from('motos')
              .select('*')
              .eq('owner_id', session.user.id);
            if (!error && Array.isArray(data)) {
              return data;
            }
          }
        } catch {}
      }
      return [];
    }
  },
};

export const offerApi = {
  create: (data) => api.post('/offers', data).then((r) => r.data),
  mine: () => api.get('/my/offers').then((r) => r.data),
  received: () => api.get('/my/received-offers').then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/offers/${id}`, { status }).then((r) => r.data),
};

export const uploadApi = {
  image: async (file) => {
    // 1. Direct upload to Supabase Storage if configured on client
    if (isSupabaseConfigured && supabase) {
      const candidateBuckets = ['motos', 'Motos', 'images', 'uploads', 'vehicles', 'public', 'motoluv'];
      const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const cleanFileName = `moto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      for (const bucket of candidateBuckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(cleanFileName, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || 'image/jpeg',
            });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(cleanFileName);

            if (publicUrlData && publicUrlData.publicUrl) {
              return {
                url: publicUrlData.publicUrl,
                filename: cleanFileName,
                provider: 'supabase',
                bucket,
              };
            }
          }
        } catch (storageErr) {
          // try next bucket
        }
      }
    }

    // 2. Fallback to backend /api/upload endpoint
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res?.data?.url) {
        return res.data;
      }
    } catch (backendErr) {
      console.warn('Backend upload fallback failed, using local preview:', backendErr);
    }

    // 3. Fallback to client-side Data URL so the user is never blocked
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result,
          filename: file.name || `photo_${Date.now()}.jpg`,
          provider: 'client_base64',
        });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },
};

export const partnerApi = {
  apply: (data) => api.post('/partners', data).then((r) => r.data),
};

export const chatApi = {
  send: (message, history = []) => api.post('/chat', { message, history }).then((r) => r.data),
};

export const stripeApi = {
  getConfig: () => api.get('/stripe/config').then((r) => r.data),
  createPaymentIntent: (data) => api.post('/stripe/create-payment-intent', data).then((r) => r.data),
  createCheckoutSession: (data) => api.post('/stripe/create-checkout-session', data).then((r) => r.data),
  processOrder: (data) => api.post('/stripe/process-order', data).then((r) => r.data),
};

export const clipApi = {
  getConfig: () => api.get('/clip/config').then((r) => r.data),
  createPaymentRequest: (data) => api.post('/clip/create-payment-request', data).then((r) => r.data),
  processCheckout: (data) => api.post('/clip/process-checkout', data).then((r) => r.data),
};

export const hubspotApi = {
  syncUserRegistration: (userData) => api.post('/webhooks/hubspot/user-register', userData).then((r) => r.data),
  syncStatusCard: (cardData) => api.post('/webhooks/hubspot/status-card', cardData).then((r) => r.data),
};

export default api;

