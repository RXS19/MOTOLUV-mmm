import axios from 'axios';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
export const API = `${BACKEND_URL}/api`;

// Feature flag: switch to Supabase when env vars are set
export const USE_SUPABASE = false;

// Helper: resolve relative image URLs (e.g. /uploads/xxx.jpg) with backend host
export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return url;
};

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('motoluv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  oauth: (data) => api.post('/auth/oauth', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateRole: (role) => api.patch('/auth/role', { role }).then((r) => r.data),
  updateBank: (data) => api.patch('/auth/bank', data).then((r) => r.data),
};

export const motoApi = {
  list: (params = {}) => api.get('/motos', { params }).then((r) => r.data),
  get: (id) => api.get(`/motos/${id}`).then((r) => r.data),
  create: (data) => api.post('/motos', data).then((r) => r.data),
  update: (id, data) => api.patch(`/motos/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/motos/${id}`).then((r) => r.data),
  mine: () => api.get('/my/motos').then((r) => r.data),
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

