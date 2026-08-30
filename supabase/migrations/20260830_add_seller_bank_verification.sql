-- =========================================================================
-- MOTOLUV - VERIFICACIÓN DE CUENTA BANCARIA DE VENDEDOR
-- =========================================================================
-- Columnas para persistir el estado de verificación y el identificador
-- de cuenta conectada requerida para recibir transferencias de ventas.
-- =========================================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bank_account_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connected_account_id TEXT;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS bank_account_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connected_account_id TEXT;
