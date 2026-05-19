-- ============================================================
--  Migration 005 — Policy per marcare prodotti come venduti
--  Eseguire in Supabase Dashboard → SQL Editor
-- ============================================================

-- Permette a qualsiasi utente autenticato di aggiornare lo status
-- di un prodotto a 'sold' o 'reserved'.
-- La policy esistente per i venditori copre già seller_id = auth.uid();
-- questa policy copre il caso del compratore che acquista il prodotto.

-- Rimuovi la policy se esiste già (sicurezza re-run)
DROP POLICY IF EXISTS "products: buyer mark sold" ON public.products;

CREATE POLICY "products: buyer mark sold"
  ON public.products FOR UPDATE
  USING  (auth.uid() IS NOT NULL)
  WITH CHECK (
    seller_id = auth.uid()          -- venditore: può aggiornare tutto
    OR status IN ('sold','reserved') -- compratore: può solo cambiare status
  );
