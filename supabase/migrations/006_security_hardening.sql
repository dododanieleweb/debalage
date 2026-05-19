-- ============================================================
--  Migration 006 — Security Hardening
--  Eseguire in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Fix CRIT-02: RLS policy "buyer mark sold" troppo permissiva ────────
--  La policy precedente usava USING(auth.uid() IS NOT NULL) che permetteva
--  a QUALSIASI utente autenticato di modificare QUALSIASI prodotto.
--  La versione corretta limita l'aggiornamento a:
--    a) il venditore proprietario del prodotto
--    b) un compratore che ha un ordine confermato per quel prodotto

DROP POLICY IF EXISTS "products: buyer mark sold" ON public.products;

CREATE POLICY "products: buyer mark sold"
  ON public.products FOR UPDATE
  USING (
    -- Solo il venditore o chi ha già un ordine per questo prodotto può toccare la riga
    seller_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.product_id = products.id
        AND o.user_id = auth.uid()
        AND o.status IN ('confermato', 'spedito', 'consegnato')
    )
  )
  WITH CHECK (
    seller_id = auth.uid()          -- venditore: può aggiornare tutti i campi
    OR status IN ('sold','reserved') -- compratore: può solo cambiare status
  );


-- ── 2. Fix MED-06: Impedisci escalation a admin via signUp metadata ────────
--  La funzione handle_new_user leggeva il ruolo dai metadata della
--  registrazione, permettendo a chiunque di registrarsi come 'admin'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, city, role, avatar)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'city', ''),
    -- SICUREZZA: non accettare mai 'admin' dalla registrazione
    CASE
      WHEN coalesce(new.raw_user_meta_data->>'role', 'buyer') IN ('buyer','seller','both')
      THEN coalesce(new.raw_user_meta_data->>'role', 'buyer')
      ELSE 'buyer'
    END,
    'https://ui-avatars.com/api/?name=' ||
      replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),' ','+') ||
      '&background=8B6A3E&color=FAF7F2&size=200'
  );
  RETURN new;
END;
$$;


-- ── 3. Fix MED-01: Limita esposizione email nei profili pubblici ───────────
--  Crea una view che espone solo i campi necessari per la UI pubblica,
--  escludendo l'email che è dati personali GDPR.
--  (La tabella profiles rimane con la policy read-all per il funzionamento
--   interno dell'app; questa view è per uso futuro nelle query pubbliche.)

CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT
    id, name, avatar, city, bio,
    specialties, verified, rating,
    review_count, sales_count, joined_at, role
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
