-- =========================================================================
-- MOTOLUV - ESQUEMA DE BASE DE DATOS SUPABASE, PERFILES Y TRIGGERS DE AUTH
-- =========================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA PÚBLICA DE PERFILES (SINCRONIZADA CON auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Ciudad de México',
  role TEXT DEFAULT 'both', -- 'comprador', 'vendedor', 'both'
  bank_clabe TEXT,
  bank_name TEXT,
  bank_holder TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  operations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNCIÓN DE TRIGGER (ACTIVO PARA REGISTROS EMAIL Y GOOGLE OAUTH):
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_city TEXT;
  v_role TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Usuario Motoluv'
  );

  v_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'phoneNumber',
    NEW.phone,
    ''
  );

  v_city := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'city', ''),
    'Ciudad de México'
  );

  v_role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'role', ''),
    'both'
  );

  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    city,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_phone,
    v_city,
    v_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' OR public.profiles.full_name = 'Usuario Motoluv' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = CASE 
      WHEN (public.profiles.phone IS NULL OR public.profiles.phone = '') AND EXCLUDED.phone <> '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    city = COALESCE(NULLIF(public.profiles.city, ''), EXCLUDED.city),
    role = COALESCE(NULLIF(public.profiles.role, ''), EXCLUDED.role),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. TABLA DE MOTOCICLETAS
CREATE TABLE IF NOT EXISTS public.motos (
  id TEXT PRIMARY KEY,
  title TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  km INTEGER NOT NULL DEFAULT 0,
  engine TEXT,
  color TEXT,
  category TEXT DEFAULT 'Naked',
  city TEXT NOT NULL DEFAULT 'Ciudad de México',
  location TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  image TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT,
  score NUMERIC(3,1) DEFAULT 9.0,
  score_details JSONB DEFAULT '{}'::jsonb,
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Publicada', -- 'Publicada', 'Apartada', 'Certificación', 'Oferta', 'Proceso de entrega', 'Entregada', 'Vendida'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE OFERTAS Y APARTADOS
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  moto_id TEXT REFERENCES public.motos(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_name TEXT,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  package TEXT DEFAULT 'plus', -- 'basico', 'plus', 'total'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
  is_apartado BOOLEAN DEFAULT false,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE SOLICITUDES DE SOCIOS Y ALIANZAS
CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  company_name TEXT,
  category TEXT NOT NULL, -- Talleres, Tiendas, Agencias, Financieras, Eventos
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- SEGURIDAD Y POLÍTICAS ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles (Privacidad y Aislamiento de Usuario)
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para Motos
DROP POLICY IF EXISTS "Permitir lectura publica de motos" ON public.motos;
CREATE POLICY "Permitir lectura publica de motos"
  ON public.motos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear motos" ON public.motos;
CREATE POLICY "Usuarios autenticados pueden crear motos"
  ON public.motos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Propietarios pueden actualizar sus motos" ON public.motos;
CREATE POLICY "Propietarios pueden actualizar sus motos"
  ON public.motos FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Propietarios pueden eliminar sus motos" ON public.motos;
CREATE POLICY "Propietarios pueden eliminar sus motos"
  ON public.motos FOR DELETE
  USING (auth.uid() = owner_id);

-- Políticas para Offers
DROP POLICY IF EXISTS "Lectura de ofertas propias" ON public.offers;
CREATE POLICY "Lectura de ofertas propias"
  ON public.offers FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Creación de ofertas autenticadas" ON public.offers;
CREATE POLICY "Creación de ofertas autenticadas"
  ON public.offers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Actualización de ofertas por vendedor o comprador" ON public.offers;
CREATE POLICY "Actualización de ofertas por vendedor o comprador"
  ON public.offers FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Políticas para Partners
DROP POLICY IF EXISTS "Permitir insercion publica de partners" ON public.partners;
CREATE POLICY "Permitir insercion publica de partners"
  ON public.partners FOR INSERT
  WITH CHECK (true);
