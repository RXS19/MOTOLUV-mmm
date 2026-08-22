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
        return res.data;
      }
      return getFallbackMotos(params);
    } catch {
      return getFallbackMotos(params);
    }
  },
  get: async (id) => {
    try {
      const res = await api.get(`/motos/${id}`);
      if (res.data && res.data.id) {
        return res.data;
      }
      const found = fallbackMotos.find((m) => m.id === id);
      if (found) return found;
      return fallbackMotos[0];
    } catch {
      const found = fallbackMotos.find((m) => m.id === id);
      if (found) return found;
      return fallbackMotos[0];
    }
  },
  create: (data) => api.post('/motos', data).then((r) => r.data),
  update: (id, data) => api.patch(`/motos/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/motos/${id}`).then((r) => r.data),
  mine: () => api.get('/my/motos').then((r) => r.data).catch(() => []),
};

export const offerApi = {
  create: (data) => api.post('/offers', data).then((r) => r.data),
  mine: () => api.get('/my/offers').then((r) => r.data),
  received: () => api.get('/my/received-offers').then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/offers/${id}`, { status }).then((r) => r.data),
};

export const uploadApi = {
  image: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { url: '/uploads/xxx.jpg', filename }
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

