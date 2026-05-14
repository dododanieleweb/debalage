-- ============================================================
--  Migration 003 — Add feature_fee to app_settings
--  Eseguire in Supabase Dashboard → SQL Editor
-- ============================================================

-- Inserisce la riga feature_fee con valore di default 0.
-- ON CONFLICT DO NOTHING: sicuro da rieseguire.
INSERT INTO public.app_settings (key, value)
  VALUES ('feature_fee', '0')
  ON CONFLICT (key) DO NOTHING;
