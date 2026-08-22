import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Supabase server client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServer = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// n8n & HubSpot Webhook Automation Trigger
async function triggerN8nHubspotWebhook(eventType: string, payload: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.HUBSPOT_WEBHOOK_URL;
  
  const formattedPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    source: 'Motoluv Platform',
    hubspot_contact: {
      email: payload.email || payload.customerEmail || payload.userEmail || '',
      firstname: (payload.name || payload.customerName || '').split(' ')[0] || 'Usuario',
      lastname: (payload.name || payload.customerName || '').split(' ').slice(1).join(' ') || 'Motoluv',
      phone: payload.phone || '',
      city: payload.city || 'Ciudad de México',
      user_type: payload.role || 'comprador',
      hs_lead_status: 'NEW',
    },
    data: payload,
  };

  // 1. Write user record to Supabase profiles database table
  if (supabaseServer && eventType === 'user.registered') {
    try {
      await supabaseServer.from('profiles').upsert([{
        id: payload.id,
        email: payload.email,
        name: payload.name,
        phone: payload.phone,
        role: payload.role || 'comprador',
        city: payload.city || '',
        created_at: payload.created_at || new Date().toISOString(),
      }], { onConflict: 'id' });
      console.log('User synced to Supabase database:', payload.email);
    } catch (err) {
      console.error('Error writing user to Supabase:', err);
    }
  }

  // 2. Trigger n8n webhook workflow for HubSpot contact creation and card status updates
  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, formattedPayload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
      console.log(`n8n/HubSpot webhook dispatched successfully [${eventType}]`);
    } catch (err: any) {
      console.warn(`n8n Webhook call failed (${err.message}). Payload prepared.`);
    }
  } else {
    console.log(`[n8n/HubSpot Automation Ready] Event: ${eventType} | Target: ${payload.email || payload.cardId || payload.id}`);
  }

  return formattedPayload;
}

let aiInstance: GoogleGenAI | null = null;
function getAIInstance(): GoogleGenAI | null {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeClient;
}

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'motoluv-super-secret-key-change-in-production';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const userId = (req as any).user?.id || 'anon';
    const filename = `${userId.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Formato no permitido. Usa: ${allowed.join(', ')}`));
  },
});

// In-memory data store
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  role: 'comprador' | 'vendedor' | 'both';
  passwordHash: string;
  created_at: string;
  avatar?: string;
  provider?: string;
  buyer_profile?: {
    shipping_city?: string;
    favorites?: string[];
  };
  seller_profile?: {
    store_name?: string;
    rfc?: string;
    bank_clabe?: string;
    bank_name?: string;
    bank_holder?: string;
    rating?: number;
    total_sales?: number;
  };
  rating: number;
  operations: number;
  bank_clabe?: string;
  bank_name?: string;
  bank_holder?: string;
}

function getCommissionRate(price: number): number {
  if (price <= 30000) return 0.10;
  if (price <= 50000) return 0.08;
  if (price <= 150000) return 0.07;
  if (price <= 300000) return 0.06;
  return 0.05;
}

function calculateCommission(price: number) {
  const rate = getCommissionRate(price);
  const amount = Math.round(price * rate);
  const net = Math.max(0, price - amount);
  return {
    commission_rate: rate,
    commission_amount: amount,
    net_payout: net,
  };
}

interface Moto {
  id: string;
  owner_id: string;
  owner_name: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  color: string;
  engine: string;
  category: string;
  city: string;
  price: number;
  commission_rate: number;
  commission_amount: number;
  net_payout: number;
  description: string;
  images: string[];
  image: string;
  score: number;
  rating: number;
  views: number;
  featured: boolean;
  status: 'active' | 'sold' | 'paused' | 'Publicada' | 'Apartada' | 'Certificación' | 'Oferta' | 'Proceso de entrega' | 'Entregada' | 'Vendida' | string;
  created_at: string;
  score_details: Record<string, number>;
}

interface Offer {
  id: string;
  moto_id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  moto_brand: string;
  moto_model: string;
  moto_image?: string;
  amount: number;
  package: 'basico' | 'plus' | 'total';
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

interface PartnerApp {
  id: string;
  name: string;
  phone: string;
  location: string;
  email?: string;
  message?: string;
  created_at: string;
  status: string;
}

const db = {
  users: new Map<string, User>(),
  usersByEmail: new Map<string, User>(),
  motos: new Map<string, Moto>(),
  offers: new Map<string, Offer>(),
  partners: new Map<string, PartnerApp>(),
};

function sanitizeUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    city: u.city,
    role: u.role || 'both',
    created_at: u.created_at,
    avatar: u.avatar,
    provider: u.provider || 'email',
    buyer_profile: u.buyer_profile || {
      shipping_city: u.city || '',
      favorites: [],
    },
    seller_profile: u.seller_profile || {
      bank_clabe: u.bank_clabe || '',
      bank_name: u.bank_name || '',
      bank_holder: u.bank_holder || '',
      rating: u.rating || 5.0,
      total_sales: u.operations || 0,
    },
    rating: u.rating,
    operations: u.operations,
    bank_clabe: u.bank_clabe,
    bank_name: u.bank_name,
    bank_holder: u.bank_holder,
  };
}

// Seed initial data
function seedDatabase() {
  if (db.motos.size > 0) return;

  const sellerId = 'seller_demo_01';
  const demoSeller: User = {
    id: sellerId,
    email: 'demo@motoluv.mx',
    name: 'Demo Motoluv',
    phone: '+52 55 0000 0000',
    city: 'Ciudad de México',
    role: 'vendedor',
    passwordHash: bcrypt.hashSync('demo1234', 10),
    created_at: new Date().toISOString(),
    rating: 4.8,
    operations: 24,
  };
  db.users.set(sellerId, demoSeller);
  db.usersByEmail.set(demoSeller.email, demoSeller);

  const motoImages = [
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.pexels.com/photos/30444779/pexels-photo-30444779.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800',
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
    'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800',
    'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=800',
    'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800',
    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800',
    'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800',
  ];

  const seeds = [
    { brand: 'Kawasaki', model: 'Ninja 400', category: 'Deportiva', engine: '399cc', price: 95000, year: 2022, km: 12000, color: 'Verde', city: 'Monterrey', score: 4.2, views: 89, featured: false, rating: 4 },
    { brand: 'Yamaha', model: 'MT-07', category: 'Naked', engine: '689cc', price: 185000, year: 2024, km: 0, color: 'Azul', city: 'Guadalajara', score: 5.0, views: 156, featured: true, rating: 5 },
    { brand: 'Honda', model: 'CB190R', category: 'Naked', engine: '184cc', price: 45000, year: 2023, km: 5000, color: 'Rojo', city: 'Ciudad de México', score: 4.5, views: 234, featured: true, rating: 5 },
    { brand: 'Ducati', model: 'Panigale V4', category: 'Deportiva', engine: '1103cc', price: 480000, year: 2024, km: 0, color: 'Rojo', city: 'Monterrey', score: 5.0, views: 342, featured: true, rating: 5 },
    { brand: 'Honda', model: 'CBR1000RR', category: 'Deportiva', engine: '999cc', price: 285000, year: 2024, km: 0, color: 'Negro', city: 'CDMX', score: 4.9, views: 156, featured: false, rating: 5 },
    { brand: 'BMW', model: 'S1000RR', category: 'Deportiva', engine: '999cc', price: 420000, year: 2024, km: 0, color: 'Rojo/Blanco', city: 'CDMX', score: 4.9, views: 267, featured: true, rating: 5 },
    { brand: 'Harley-Davidson', model: 'Iron 883', category: 'Cruiser', engine: '883cc', price: 260000, year: 2024, km: 1200, color: 'Negro', city: 'Tijuana', score: 4.5, views: 210, featured: true, rating: 4 },
    { brand: 'Yamaha', model: 'Tenere 700', category: 'Adventure', engine: '689cc', price: 220000, year: 2024, km: 0, color: 'Azul', city: 'Mérida', score: 4.9, views: 121, featured: true, rating: 5 },
    { brand: 'Honda', model: 'Africa Twin', category: 'Adventure', engine: '1084cc', price: 320000, year: 2024, km: 0, color: 'Negro', city: 'Toluca', score: 4.7, views: 87, featured: false, rating: 5 },
    { brand: 'KTM', model: 'Duke 390', category: 'Naked', engine: '373cc', price: 98000, year: 2024, km: 500, color: 'Naranja', city: 'Guadalajara', score: 4.6, views: 112, featured: false, rating: 4 },
    { brand: 'BMW', model: 'GS 1250', category: 'Adventure', engine: '1254cc', price: 385000, year: 2024, km: 2000, color: 'Blanco', city: 'Monterrey', score: 4.8, views: 178, featured: false, rating: 5 },
    { brand: 'Triumph', model: 'Street Triple 765', category: 'Naked', engine: '765cc', price: 210000, year: 2024, km: 1200, color: 'Negro', city: 'Puebla', score: 4.7, views: 89, featured: false, rating: 5 },
    { brand: 'Ducati', model: 'Monster 937', category: 'Naked', engine: '937cc', price: 265000, year: 2024, km: 800, color: 'Rojo', city: 'CDMX', score: 4.8, views: 145, featured: false, rating: 5 },
    { brand: 'Aprilia', model: 'RS 660', category: 'Deportiva', engine: '659cc', price: 195000, year: 2024, km: 0, color: 'Negro/Rojo', city: 'Querétaro', score: 4.6, views: 76, featured: false, rating: 4 },
    { brand: 'Kawasaki', model: 'Z900', category: 'Naked', engine: '948cc', price: 205000, year: 2024, km: 3000, color: 'Verde', city: 'Guadalajara', score: 4.7, views: 132, featured: false, rating: 5 },
    { brand: 'Yamaha', model: 'R7', category: 'Deportiva', engine: '689cc', price: 168000, year: 2024, km: 1500, color: 'Azul', city: 'Mérida', score: 4.5, views: 65, featured: false, rating: 5 },
    { brand: 'Honda', model: 'Rebel 500', category: 'Cruiser', engine: '471cc', price: 115000, year: 2024, km: 500, color: 'Negro', city: 'León', score: 4.4, views: 78, featured: false, rating: 4 },
    { brand: 'Yamaha', model: 'NMAX', category: 'Scooter', engine: '155cc', price: 55000, year: 2024, km: 0, color: 'Gris', city: 'Puebla', score: 4.3, views: 78, featured: false, rating: 4 },
    { brand: 'Honda', model: 'PCX150', category: 'Scooter', engine: '149cc', price: 62000, year: 2024, km: 0, color: 'Blanco', city: 'Querétaro', score: 4.4, views: 34, featured: false, rating: 4 },
    { brand: 'Suzuki', model: 'V-Strom 650', category: 'Adventure', engine: '645cc', price: 165000, year: 2024, km: 0, color: 'Amarillo', city: 'León', score: 4.6, views: 92, featured: false, rating: 5 },
    { brand: 'Harley-Davidson', model: 'Sportster S', category: 'Cruiser', engine: '1252cc', price: 335000, year: 2024, km: 0, color: 'Negro', city: 'CDMX', score: 4.8, views: 156, featured: true, rating: 5 },
    { brand: 'Yamaha', model: 'XSR900', category: 'Naked', engine: '890cc', price: 195000, year: 2024, km: 1200, color: 'Amarillo', city: 'Guadalajara', score: 4.7, views: 92, featured: false, rating: 5 },
  ];

  seeds.forEach((s, i) => {
    const id = `moto_${Math.random().toString(36).slice(2, 10)}`;
    const imgs = [
      motoImages[i % motoImages.length],
      motoImages[(i + 1) % motoImages.length],
      motoImages[(i + 2) % motoImages.length],
      motoImages[(i + 3) % motoImages.length],
    ];
    const comm = calculateCommission(s.price);
    const statuses = ['Publicada', 'Publicada', 'Apartada', 'Certificación', 'Oferta', 'Proceso de entrega', 'Entregada', 'Vendida'];
    const assignedStatus = statuses[i % statuses.length];

    const moto: Moto = {
      id,
      owner_id: sellerId,
      owner_name: demoSeller.name,
      brand: s.brand,
      model: s.model,
      year: s.year,
      km: s.km,
      color: s.color,
      engine: s.engine,
      category: s.category,
      city: s.city,
      price: s.price,
      commission_rate: comm.commission_rate,
      commission_amount: comm.commission_amount,
      net_payout: comm.net_payout,
      description: `Excelente ${s.brand} ${s.model} en muy buen estado. Mantenimientos al día en agencia. Ideal para quien busca una moto ${s.category.toLowerCase()} confiable y con historial verificado.`,
      images: imgs,
      image: imgs[0],
      score: s.score,
      rating: s.rating,
      views: s.views,
      featured: s.featured,
      status: assignedStatus,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      score_details: {
        Motor: Math.min(100, 70 + ((i * 3) % 30)),
        Frenos: Math.min(100, 75 + ((i * 5) % 25)),
        Suspensión: Math.min(100, 72 + ((i * 7) % 28)),
        Transmisión: Math.min(100, 80 + ((i * 4) % 20)),
        Neumáticos: Math.min(100, 65 + ((i * 6) % 35)),
        Eléctrico: Math.min(100, 78 + ((i * 2) % 22)),
      },
    };
    db.motos.set(id, moto);
  });
}

// Auth Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ detail: 'No autenticado' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = db.users.get(payload.sub);
    if (!user) return res.status(401).json({ detail: 'Usuario no encontrado' });
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ detail: 'Token inválido' });
  }
}

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Seed database immediately on module initialization
seedDatabase();

export const api = express.Router();

api.get('/health', (_req, res) => {
  return res.json({ status: 'ok', motos_count: db.motos.size, timestamp: new Date().toISOString() });
});

api.get('/', (_req, res) => {
  res.json({ message: 'Motoluv API', version: '1.0', motos_count: db.motos.size });
});

  // Auth Routes
  api.post('/auth/register', (req, res) => {
    const { email, name, password, phone, city, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ detail: 'Campos requeridos faltantes' });
    }
    if (db.usersByEmail.has(email)) {
      return res.status(400).json({ detail: 'Email ya registrado' });
    }

    const id = `user_${Math.random().toString(36).slice(2, 10)}`;
    const user: User = {
      id,
      email,
      name,
      phone: phone || '',
      city: city || '',
      role: role || 'comprador',
      passwordHash: bcrypt.hashSync(password, 10),
      created_at: new Date().toISOString(),
      rating: 5.0,
      operations: 0,
    };
    db.users.set(id, user);
    db.usersByEmail.set(email, user);

    // Trigger n8n/HubSpot webhook & Supabase database sync on new user registration
    triggerN8nHubspotWebhook('user.registered', user);

    const token = jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ access_token: token, token_type: 'bearer', user: sanitizeUser(user) });
  });

  api.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.usersByEmail.get(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ detail: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ access_token: token, token_type: 'bearer', user: sanitizeUser(user) });
  });

  api.post('/auth/oauth', (req, res) => {
    const { provider, email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ detail: 'Email de OAuth no provisto' });
    }

    let user = db.usersByEmail.get(email);
    if (!user) {
      const id = `user_${Math.random().toString(36).slice(2, 10)}`;
      user = {
        id,
        email,
        name: name || email.split('@')[0],
        phone: '',
        city: 'Ciudad de México',
        role: 'both',
        passwordHash: '',
        created_at: new Date().toISOString(),
        avatar: avatar || '',
        provider: provider || 'google',
        buyer_profile: { shipping_city: 'Ciudad de México', favorites: [] },
        seller_profile: { rating: 5.0, total_sales: 0 },
        rating: 5.0,
        operations: 0,
      };
      db.users.set(id, user);
      db.usersByEmail.set(email, user);

      // Trigger n8n/HubSpot webhook & Supabase database sync
      triggerN8nHubspotWebhook('user.registered', user);
    } else {
      user.role = 'both';
      user.provider = provider || user.provider;
      if (avatar && !user.avatar) user.avatar = avatar;
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ access_token: token, token_type: 'bearer', user: sanitizeUser(user) });
  });

  api.get('/auth/me', authenticateToken, (req, res) => {
    return res.json(sanitizeUser((req as any).user));
  });

  api.patch('/auth/role', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const { role } = req.body;
    if (['comprador', 'vendedor', 'both'].includes(role)) {
      user.role = role;
    }
    return res.json(sanitizeUser(user));
  });

  api.patch('/auth/bank', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const { clabe, bank_name, holder } = req.body;
    const cleanClabe = (clabe || '').replace(/\s/g, '');
    if (!/^\d{18}$/.test(cleanClabe)) {
      return res.status(400).json({ detail: 'La CLABE debe tener exactamente 18 dígitos numéricos' });
    }
    if (!bank_name || !bank_name.trim()) {
      return res.status(400).json({ detail: 'Selecciona un banco' });
    }

    user.bank_clabe = cleanClabe;
    user.bank_name = bank_name.trim();
    user.bank_holder = (holder || '').trim();
    return res.json(sanitizeUser(user));
  });

  // Moto Routes
  api.get('/motos', (req, res) => {
    const { brand, category, city, q, featured, limit, status } = req.query;
    let list = Array.from(db.motos.values());

    if (status) {
      list = list.filter((m) => m.status === status);
    } else {
      // By default list active operations (Publicada, active, Apartada, Certificación, Oferta, Proceso de entrega)
      list = list.filter((m) => m.status !== 'Vendida' && m.status !== 'Entregada');
    }

    if (brand) list = list.filter((m) => m.brand === brand);
    if (category) list = list.filter((m) => m.category === category);
    if (city) list = list.filter((m) => m.city === city);
    if (featured !== undefined) {
      const isFeat = String(featured).toLowerCase() === 'true' || String(featured) === '1';
      list = list.filter((m) => Boolean(m.featured) === isFeat);
    }
    if (q) {
      const queryStr = String(q).toLowerCase();
      list = list.filter(
        (m) => m.brand.toLowerCase().includes(queryStr) || m.model.toLowerCase().includes(queryStr)
      );
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const max = limit ? parseInt(String(limit), 10) : 100;
    return res.json(list.slice(0, max));
  });

  api.get('/motos/:id', (req, res) => {
    const moto = db.motos.get(req.params.id);
    if (!moto) return res.status(404).json({ detail: 'Motocicleta no encontrada' });
    moto.views += 1;
    return res.json(moto);
  });

  api.post('/motos', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    if (!['vendedor', 'both'].includes(user.role)) {
      return res.status(403).json({ detail: 'Necesitas perfil de vendedor' });
    }

    const { brand, model, year, km, color, engine, category, city, price, description, images } = req.body;
    const defaultImg = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800';
    const imgs = images && images.length > 0 ? images : [defaultImg];
    const id = `moto_${Math.random().toString(36).slice(2, 10)}`;

    const numericPrice = parseInt(price, 10) || 0;
    const comm = calculateCommission(numericPrice);

    const moto: Moto = {
      id,
      owner_id: user.id,
      owner_name: user.name,
      brand,
      model,
      year: parseInt(year, 10) || 2024,
      km: parseInt(km, 10) || 0,
      color: color || '',
      engine: engine || '',
      category: category || 'Naked',
      city: city || '',
      price: numericPrice,
      commission_rate: comm.commission_rate,
      commission_amount: comm.commission_amount,
      net_payout: comm.net_payout,
      description: description || '',
      images: imgs,
      image: imgs[0],
      score: 4.5,
      rating: 5,
      views: 0,
      featured: false,
      status: 'Publicada',
      created_at: new Date().toISOString(),
      score_details: {
        Motor: 85,
        Frenos: 82,
        Suspensión: 80,
        Transmisión: 88,
        Neumáticos: 75,
        Eléctrico: 90,
      },
    };

    db.motos.set(id, moto);

    // Sync listing creation card to n8n / HubSpot
    triggerN8nHubspotWebhook('card.status_created', {
      cardId: `card_${id}`,
      title: `${brand} ${model}`,
      status: 'Publicada',
      userId: user.id,
      userEmail: user.email,
      motoId: id,
      price: numericPrice,
    });

    return res.json(moto);
  });

  api.patch('/motos/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const moto = db.motos.get(req.params.id);
    if (!moto) return res.status(404).json({ detail: 'No encontrada' });
    if (moto.owner_id !== user.id) return res.status(403).json({ detail: 'No autorizado' });

    const previousStatus = moto.status;
    Object.assign(moto, req.body);
    if (req.body.images && req.body.images.length > 0) {
      moto.image = req.body.images[0];
    }

    // Trigger status card update webhook for n8n / HubSpot sync
    if (req.body.status || previousStatus !== moto.status) {
      triggerN8nHubspotWebhook('card.status_updated', {
        cardId: `card_${moto.id}`,
        title: `${moto.brand} ${moto.model}`,
        status: moto.status,
        userId: user.id,
        userEmail: user.email,
        motoId: moto.id,
      });
    }

    return res.json(moto);
  });

  api.delete('/motos/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const moto = db.motos.get(req.params.id);
    if (!moto) return res.status(404).json({ detail: 'No encontrada' });
    if (moto.owner_id !== user.id) return res.status(403).json({ detail: 'No autorizado' });

    const activeOffers = Array.from(db.offers.values()).filter(
      (o) => o.moto_id === req.params.id && ['pending', 'accepted'].includes(o.status)
    );
    if (activeOffers.length > 0) {
      return res.status(400).json({
        detail: `No puedes eliminar esta publicación: tiene ${activeOffers.length} oferta(s) activa(s). Debes rechazar o completar las ofertas primero.`,
      });
    }

    db.motos.delete(req.params.id);
    return res.json({ ok: true });
  });

  api.get('/my/motos', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const list = Array.from(db.motos.values()).filter((m) => m.owner_id === user.id);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.json(list);
  });

  // Offer Routes
  api.post('/offers', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const { moto_id, amount, package: pkg, message, is_apartado } = req.body;
    const moto = db.motos.get(moto_id);
    if (!moto) return res.status(404).json({ detail: 'Moto no encontrada' });
    if (moto.owner_id === user.id) {
      return res.status(400).json({ detail: 'No puedes ofertar o apartar tu propia moto' });
    }

    const id = `offer_${Math.random().toString(36).slice(2, 10)}`;
    const parsedAmount = parseInt(amount, 10) || 600;
    const isApartado = Boolean(is_apartado || parsedAmount === 600);

    const offer: any = {
      id,
      moto_id,
      buyer_id: user.id,
      buyer_name: user.name,
      seller_id: moto.owner_id,
      moto_brand: moto.brand,
      moto_model: moto.model,
      moto_image: moto.image,
      amount: parsedAmount,
      package: pkg || 'plus',
      message: message || '',
      status: isApartado ? 'accepted' : 'pending',
      is_apartado: isApartado,
      created_at: new Date().toISOString(),
    };

    if (isApartado) {
      moto.status = 'Apartada';
    }

    db.offers.set(id, offer);
    return res.json(offer);
  });

  api.get('/my/offers', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const list = Array.from(db.offers.values()).filter((o) => o.buyer_id === user.id);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.json(list);
  });

  api.get('/my/received-offers', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const list = Array.from(db.offers.values()).filter((o) => o.seller_id === user.id);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.json(list);
  });

  api.patch('/offers/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const offer = db.offers.get(req.params.id);
    if (!offer) return res.status(404).json({ detail: 'Oferta no encontrada' });
    const { status } = req.body;

    if (['accepted', 'rejected', 'completed'].includes(status) && offer.seller_id !== user.id) {
      return res.status(403).json({ detail: 'Solo el vendedor puede actualizar el estado' });
    }

    offer.status = status;
    return res.json(offer);
  });

  // Upload Route
  api.post('/upload', authenticateToken, (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ detail: err.message || 'Error al subir archivo' });
      }
      if (!req.file) {
        return res.status(400).json({ detail: 'No se envió ningún archivo' });
      }
      return res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
    });
  });

  // Stripe Payment Routes
  api.get('/stripe/config', (_req, res) => {
    return res.json({
      publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
      hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
    });
  });

  api.post('/stripe/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'mxn', items = [], metadata = {}, customerEmail } = req.body;
      const stripe = getStripe();

      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // in cents
          currency: currency.toLowerCase(),
          receipt_email: customerEmail || undefined,
          metadata: {
            app: 'motoluv',
            itemsCount: String(items.length),
            ...metadata,
          },
          automatic_payment_methods: { enabled: true },
        });

        return res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          isLive: true,
        });
      }

      // Fallback mode when STRIPE_SECRET_KEY is not configured
      const mockId = `pi_mock_${Math.random().toString(36).slice(2, 14)}`;
      return res.json({
        clientSecret: `${mockId}_secret_${Math.random().toString(36).slice(2, 10)}`,
        paymentIntentId: mockId,
        isLive: false,
        message: 'Modo de prueba Stripe simulado activo. Para pagos en producción en vivo, configura STRIPE_SECRET_KEY en las variables de entorno.',
      });
    } catch (err: any) {
      console.error('Error creating Stripe Payment Intent:', err);
      return res.status(500).json({ detail: err.message || 'Error al conectar con Stripe' });
    }
  });

  api.post('/stripe/create-checkout-session', async (req, res) => {
    try {
      const { items = [], successUrl, cancelUrl, customerEmail } = req.body;
      const stripe = getStripe();

      if (stripe) {
        const lineItems = items.map((item: any) => ({
          price_data: {
            currency: 'mxn',
            product_data: {
              name: item.name,
              description: `${item.brand || 'Motoluv'} - ${item.category || 'Accesorio'}`,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          customer_email: customerEmail || undefined,
          success_url: successUrl || `${req.headers.origin}/tienda?status=success`,
          cancel_url: cancelUrl || `${req.headers.origin}/tienda?status=cancel`,
        });

        return res.json({ url: session.url, sessionId: session.id, isLive: true });
      }

      // Fallback
      return res.json({
        url: null,
        sessionId: `cs_mock_${Date.now()}`,
        isLive: false,
        message: 'Modo de simulación Stripe activo.',
      });
    } catch (err: any) {
      console.error('Error creating Stripe Checkout session:', err);
      return res.status(500).json({ detail: err.message || 'Error al iniciar Checkout de Stripe' });
    }
  });

  api.post('/stripe/process-order', (req, res) => {
    const { items, totalAmount, shippingAddress, customerInfo, paymentIntentId } = req.body;
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = {
      orderId,
      items: items || [],
      totalAmount: totalAmount || 0,
      shippingAddress: shippingAddress || {},
      customerInfo: customerInfo || {},
      paymentIntentId: paymentIntentId || `pi_sim_${Date.now()}`,
      status: 'Paid',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    return res.json({ success: true, order });
  });

  // Clip Payment Routes
  api.get('/clip/config', (_req, res) => {
    return res.json({
      hasClipKey: Boolean(process.env.CLIP_API_KEY || process.env.CLIP_SECRET_KEY),
      publicKey: process.env.VITE_CLIP_PUBLIC_KEY || '',
      provider: 'Clip México',
      supportedMethods: ['Tarjeta de Crédito / Débito', 'Clip QR', 'Link de Pago Clip'],
    });
  });

  api.post('/clip/create-payment-request', async (req, res) => {
    try {
      const { amount, description, customerEmail, customerName, isApartado, motoId, items = [] } = req.body;
      const clipReference = `CLIP-${isApartado ? 'MOTO' : 'STORE'}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Build Clip Checkout URL or Token
      const clipPayload = {
        amount: Number(amount) || 3000,
        currency: 'MXN',
        purchase_description: description || (isApartado ? 'Apartado de Motocicleta Motoluv' : 'Compra de Accesorios Motoluv'),
        redirection_url: {
          success: `${req.headers.origin || 'http://localhost:3000'}/panel?clip_status=success&ref=${clipReference}`,
          error: `${req.headers.origin || 'http://localhost:3000'}/panel?clip_status=error&ref=${clipReference}`,
          default: `${req.headers.origin || 'http://localhost:3000'}/panel`,
        },
        metadata: {
          clipReference,
          customerEmail,
          customerName,
          isApartado: Boolean(isApartado),
          motoId,
          itemsCount: items.length,
        },
      };

      // Trigger n8n webhook automation for initiated Clip transaction
      triggerN8nHubspotWebhook('payment.clip_initiated', {
        clipReference,
        amount,
        customerEmail,
        customerName,
        isApartado,
        motoId,
      });

      return res.json({
        success: true,
        clipReference,
        amount: Number(amount),
        currency: 'MXN',
        paymentUrl: `https://pay.clip.mx/${clipReference}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://pay.clip.mx/${clipReference}`,
        status: 'PENDING_PAYMENT',
      });
    } catch (err: any) {
      console.error('Error creating Clip payment request:', err);
      return res.status(500).json({ detail: err.message || 'Error al conectar con Clip México' });
    }
  });

  api.post('/clip/process-checkout', (req, res) => {
    const { amount, items, shippingAddress, customerInfo, clipReference, isApartado, motoId } = req.body;
    const orderId = `CLIP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Update motorcycle status if it was an apartado
    if (isApartado && motoId) {
      const moto = db.motos.get(motoId);
      if (moto) {
        moto.status = 'Apartada';
        triggerN8nHubspotWebhook('card.status_updated', {
          cardId: `card_${moto.id}`,
          title: `${moto.brand} ${moto.model}`,
          status: 'Apartada',
          userEmail: customerInfo?.email,
          motoId: moto.id,
        });
      }
    }

    const order = {
      orderId,
      clipReference: clipReference || `clip_ref_${Date.now()}`,
      items: items || [],
      totalAmount: amount || 0,
      paymentMethod: 'Clip México',
      shippingAddress: shippingAddress || {},
      customerInfo: customerInfo || {},
      status: 'Paid',
      createdAt: new Date().toISOString(),
      estimatedDelivery: '24 a 48 horas hábiles con Clip',
    };

    triggerN8nHubspotWebhook('payment.clip_completed', order);

    return res.json({ success: true, order });
  });

  // Webhooks Endpoints for HubSpot & n8n Sync
  api.post('/webhooks/hubspot/user-register', async (req, res) => {
    const payload = req.body;
    const result = await triggerN8nHubspotWebhook('user.registered', payload);
    return res.json({ success: true, synced: true, payload: result });
  });

  api.post('/webhooks/hubspot/status-card', async (req, res) => {
    const { cardId, title, status, userId, userEmail, motoId, details } = req.body;
    const result = await triggerN8nHubspotWebhook('card.status_updated', {
      cardId, title, status, userId, userEmail, motoId, details,
    });
    return res.json({ success: true, synced: true, payload: result });
  });

  // Partners Route
  api.post('/partners', (req, res) => {
    const { name, position, company_name, category, phone, email, message } = req.body;
    const id = `partner_${Math.random().toString(36).slice(2, 10)}`;
    const appDoc: PartnerApp = {
      id,
      name,
      phone,
      location: category || 'socio',
      email,
      message: `[${position || 'Contacto'} - ${company_name || 'Empresa'}] ${message || ''}`,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    db.partners.set(id, appDoc);
    return res.json({ ok: true, id });
  });

  // Lu Chatbot Route
  api.post('/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ detail: 'Mensaje requerido' });
      }

      // Security check: Block attempts to retrieve confidential user data
      const lower = message.toLowerCase();
      if (
        lower.includes('clabe') ||
        lower.includes('contraseña') ||
        lower.includes('password') ||
        lower.includes('jwt') ||
        lower.includes('token') ||
        lower.includes('cuenta bancaria') ||
        lower.includes('tarjeta') ||
        lower.includes('cvv') ||
        lower.includes('secret')
      ) {
        return res.json({
          reply: 'Por políticas de privacidad y estricta seguridad, jamás puedo solicitar ni compartir información confidencial como números CLABE, contraseñas o datos de pago. 🔒 Si necesitas asistencia con tu cuenta, escribe a contacto@motoluv.mx',
          confidentialBlocked: true,
        });
      }

      // Prepare context of Motoluv
      const activeMotos = Array.from(db.motos.values())
        .filter((m) => m.status !== 'Vendida' && m.status !== 'Entregada')
        .map((m) => `• ${m.brand} ${m.model} (${m.year}) - $${m.price.toLocaleString()} MXN | ${m.km.toLocaleString()} km | Score: ${m.score}/10 | Ubicación: ${m.city}`);

      const systemPrompt = `Eres "Lu", el asistente virtual oficial de Motoluv.
Tu tono es amable, apasionado por las motos, servicial y profesional. NUNCA te autodefinas ni menciones la palabra "mascota" ni "IA". Preséntate siempre simplemente como Lu, el asistente oficial de Motoluv.

REGLA DE SEGURIDAD ABSOLUTA:
Jamás reveles o solicites información confidencial de usuarios (cuentas bancarias, contraseñas, datos personales privados, etc.).

INFORMACIÓN DEL SITIO MOTOLUV:
- Qué es Motoluv: El marketplace más seguro de compra y venta de motocicletas seminuevas en México.
- Eslogan: SUBE · CONECTA · RUEDA.
- Garantía y Protección: Motoluv resguarda la operación con transacciones y pagos verificados hasta que se complete la entrega.
- Paquetes de Servicio:
  1. Básico ($1,900 MXN): Inspección técnica con Score de 100 puntos y contrato digital.
  2. Plus ($3,900 MXN): Básico + protección de pago verificada y validación de documentos.
  3. Total ($5,900 MXN): Plus + traslado nacional garantizado hasta tu puerta.
- Red de Socios ("Súmate a nuestra red"): Talleres mecánicos, tiendas de accesorios, agencias de motocicletas, financieras y organizadores de eventos pueden registrarse en la sección "/sumate".
- Inventario actual de motocicletas disponibles:
${activeMotos.slice(0, 10).join('\n')}

- Tienda de equipamiento disponible (/tienda):
Cascos de marcas reconocidas, chaquetas con armadura, guantes tácticos, intercomunicadores y accesorios.

Responde siempre en español, de forma concisa, clara y amigable con emojis acordes (🏍️, 🐾, ⚡, 🛡️).`;

      const ai = getAIInstance();
      if (ai) {
        try {
          const contents: any[] = [];
          if (Array.isArray(history)) {
            for (const h of history) {
              if (h && h.content) {
                contents.push({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: String(h.content) }],
                });
              }
            }
          }
          contents.push({
            role: 'user',
            parts: [{ text: message }],
          });

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          const replyText = response.text || '¡Hola! Soy Lu 🐾. ¿En qué puedo ayudarte hoy sobre motos o accesorios en Motoluv?';
          return res.json({ reply: replyText });
        } catch (geminiErr: any) {
          console.error('Gemini API execution error:', geminiErr?.message || geminiErr);
          // Fall through to fallback responses if Gemini fails
        }
      }

      // Smart fallback response generator when AI key is absent or pending
      let fallback = '';
      if (lower.includes('hola') || lower.includes('saludos') || lower.includes('buenos')) {
        fallback = '¡Hola, Biker! 🐾 Soy Lu, el asistente virtual de Motoluv. ¿Buscas comprar una moto, equiparte en la tienda o registrar tu negocio en nuestra red de aliados? Cuéntame y con gusto te asesoro. 🏍️';
      } else if (lower.includes('moto') || lower.includes('comprar') || lower.includes('catálogo') || lower.includes('catalogo')) {
        fallback = `En Motoluv contamos con un catálogo certificado con score de 100 puntos 🏁. Algunas opciones disponibles hoy:\n\n${activeMotos.slice(0, 3).join('\n')}\n\nPuedes consultar el inventario completo en la pestaña "Catálogo" (/motos).`;
      } else if (lower.includes('accesorio') || lower.includes('casco') || lower.includes('tienda') || lower.includes('chaqueta')) {
        fallback = 'En nuestra Tienda Oficial (/tienda) encontrarás cascos certificados, chaquetas con protección, guantes y equipamiento de alta calidad 🛡️.';
      } else if (lower.includes('red') || lower.includes('sumate') || lower.includes('socio') || lower.includes('taller') || lower.includes('agencia') || lower.includes('financiera') || lower.includes('evento')) {
        fallback = '¡Súmate a nuestra red! 🤝 Si tienes un taller, tienda de accesorios, agencia de motocicletas, financiera u organizas eventos, ingresa a "/sumate" para registrar tus datos y conectarte con miles de motociclistas.';
      } else if (lower.includes('paquete') || lower.includes('garantia') || lower.includes('garantía') || lower.includes('seguro')) {
        fallback = 'En Motoluv tu dinero está 100% protegido con transacciones verificadas 🔒. Contamos con paquetes Básico ($1,900), Plus ($3,900) y Total ($5,900 con envío nacional).';
      } else {
        fallback = '¡Con gusto te orientó! 🐾 En Motoluv puedes comprar o vender motos seminuevas garantizadas, adquirir accesorios o sumar tu taller o negocio a nuestra red en la sección "/sumate". ¿Qué te gustaría consultar?';
      }

      return res.json({ reply: fallback });
    } catch (err: any) {
      console.error('Chat API Error:', err);
      return res.json({
        reply: '¡Ups! Ocurrió un pequeño inconveniente en el camino ⚡. Pero puedes explorar nuestro catálogo de motos en /motos o ingresar a la tienda.',
      });
    }
  });

  // Seed Route
  api.post('/seed', (_req, res) => {
    seedDatabase();
    return res.json({ ok: true, seeded: db.motos.size });
  });

  // Mount API router
  app.use('/api', api);

  async function startServer() {
    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on http://0.0.0.0:${PORT}`);
      });
    }
  }

  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });

  export default app;
