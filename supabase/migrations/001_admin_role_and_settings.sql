-- ============================================================
--  Migration 001 — Admin role + app_settings table
--  Eseguire in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Aggiunge 'admin' al check constraint del campo role in profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('buyer', 'seller', 'both', 'admin'));

-- 2. Crea la tabella app_settings (key-value per configurazioni piattaforma)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text        PRIMARY KEY,
  value      text        NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Tutti possono leggere (es. per mostrare la quota ai venditori)
CREATE POLICY "app_settings: read all"
  ON public.app_settings FOR SELECT USING (true);

-- Solo admin possono inserire/modificare
CREATE POLICY "app_settings: admin insert"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "app_settings: admin update"
  ON public.app_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Valore di default per la quota evento (0 = gratuito)
INSERT INTO public.app_settings (key, value)
  VALUES ('event_fee', '0')
  ON CONFLICT (key) DO NOTHING;
