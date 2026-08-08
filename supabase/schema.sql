-- =========================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS Y ROLES PARA MOTOLUV (SUPABASE)
-- =========================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA PRINCIPAL DE USUARIOS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  roles TEXT[] DEFAULT ARRAY['buyer', 'seller'], -- Soporta ambos perfiles con el mismo correo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PERFIL DE COMPRADOR (Información separada de compras)
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  shipping_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  favorites JSONB DEFAULT '[]'::jsonb,
  saved_offers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. PERFIL DE VENDEDOR (Información bancaria y comisiones)
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  store_name TEXT,
  rfc TEXT,
  bank_name TEXT,
  bank_clabe TEXT,
  bank_holder TEXT,
  total_sales INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. MOTOCICLETAS (Con desglose de comisión del vendedor)
CREATE TABLE IF NOT EXISTS public.motos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  seller_email TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,2) NOT NULL, -- e.g. 0.10, 0.08, 0.07, 0.06
  commission_amount NUMERIC(10,2) NOT NULL, -- e.g. $2,400
  net_payout NUMERIC(10,2) NOT NULL, -- e.g. $27,600 (Precio - Comisión)
  km INTEGER NOT NULL,
  score NUMERIC(3,1) DEFAULT 9.0,
  city TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'reserved', 'sold'
  description TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OFERTAS Y TRANSACCIONES
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moto_id UUID REFERENCES public.motos(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SOLICITUDES DE RED DE SOCIOS Y ALIANZAS
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL, -- Talleres, Tiendas, Agencias, Financieras, Eventos
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REGLAS DE SEGURIDAD (ROW LEVEL SECURITY)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Políticas públicas permisivas para desarrollo
CREATE POLICY "Permitir lectura publica de motos" ON public.motos FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica de partners" ON public.partners FOR INSERT WITH CHECK (true);
