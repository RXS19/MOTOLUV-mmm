import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

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
  rating: number;
  operations: number;
  bank_clabe?: string;
  bank_name?: string;
  bank_holder?: string;
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
  description: string;
  images: string[];
  image: string;
  score: number;
  rating: number;
  views: number;
  featured: boolean;
  status: 'active' | 'sold' | 'paused';
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
    role: u.role,
    created_at: u.created_at,
    avatar: u.avatar,
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
    'https://images.unsplash.com/photo-1611241443322-b5c0f7f70e2f?w=800',
    'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800',
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
    'https://images.unsplash.com/photo-1508357941304-42a883c78f89?w=800',
    'https://images.unsplash.com/photo-1517846875602-9c8ce67cfe75?w=800',
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
      description: `Excelente ${s.brand} ${s.model} en muy buen estado. Mantenimientos al día en agencia. Ideal para quien busca una moto ${s.category.toLowerCase()} confiable y con historial verificado.`,
      images: imgs,
      image: imgs[0],
      score: s.score,
      rating: s.rating,
      views: s.views,
      featured: s.featured,
      status: 'active',
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

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve upload files
  app.use('/uploads', express.static(UPLOAD_DIR));

  // Seed on startup
  seedDatabase();

  const api = express.Router();

  api.get('/', (_req, res) => {
    res.json({ message: 'Motoluv API', version: '1.0' });
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
    const { brand, category, city, q, featured, limit } = req.query;
    let list = Array.from(db.motos.values()).filter((m) => m.status === 'active');

    if (brand) list = list.filter((m) => m.brand === brand);
    if (category) list = list.filter((m) => m.category === category);
    if (city) list = list.filter((m) => m.city === city);
    if (featured !== undefined) list = list.filter((m) => m.featured === (featured === 'true'));
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
      price: parseInt(price, 10) || 0,
      description: description || '',
      images: imgs,
      image: imgs[0],
      score: 4.5,
      rating: 5,
      views: 0,
      featured: false,
      status: 'active',
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
    return res.json(moto);
  });

  api.patch('/motos/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const moto = db.motos.get(req.params.id);
    if (!moto) return res.status(404).json({ detail: 'No encontrada' });
    if (moto.owner_id !== user.id) return res.status(403).json({ detail: 'No autorizado' });

    Object.assign(moto, req.body);
    if (req.body.images && req.body.images.length > 0) {
      moto.image = req.body.images[0];
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
    const { moto_id, amount, package: pkg, message } = req.body;
    const moto = db.motos.get(moto_id);
    if (!moto) return res.status(404).json({ detail: 'Moto no encontrada' });
    if (moto.owner_id === user.id) {
      return res.status(400).json({ detail: 'No puedes ofertar en tu propia moto' });
    }

    const id = `offer_${Math.random().toString(36).slice(2, 10)}`;
    const offer: Offer = {
      id,
      moto_id,
      buyer_id: user.id,
      buyer_name: user.name,
      seller_id: moto.owner_id,
      moto_brand: moto.brand,
      moto_model: moto.model,
      moto_image: moto.image,
      amount: parseInt(amount, 10),
      package: pkg || 'plus',
      message: message || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

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

  // Partners Route
  api.post('/partners', (req, res) => {
    const { name, phone, location, email, message } = req.body;
    const id = `partner_${Math.random().toString(36).slice(2, 10)}`;
    const appDoc: PartnerApp = {
      id,
      name,
      phone,
      location,
      email,
      message,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    db.partners.set(id, appDoc);
    return res.json({ ok: true, id });
  });

  // Seed Route
  api.post('/seed', (_req, res) => {
    seedDatabase();
    return res.json({ ok: true, seeded: db.motos.size });
  });

  app.use('/api', api);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
