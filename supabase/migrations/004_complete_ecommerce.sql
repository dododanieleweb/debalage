-- ============================================================
--  Migration 004 — E-commerce completo
--  Eseguire in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Colonne mancanti in events (tags, price erano ignorati)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS tags  text[]         DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price numeric(10,2)  DEFAULT 0;

-- 2. Colonne mancanti in products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS saves integer DEFAULT 0;

-- 3. Tabella pending_fees — quote in attesa di pagamento
--    Tiene traccia di ogni importo che un venditore deve all'admin:
--    - event_publish  : quota per pubblicare un evento
--    - feature_event  : quota per mettere in evidenza un evento
--    - feature_product: quota per mettere in evidenza un prodotto
CREATE TABLE IF NOT EXISTS public.pending_fees (
  id              text          PRIMARY KEY,
  type            text          NOT NULL
                    CHECK (type IN ('event_publish','feature_event','feature_product')),
  seller_id       uuid          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reference_id    text          NOT NULL,   -- event_id o product_id
  reference_title text          NOT NULL DEFAULT '',
  amount          numeric(10,2) NOT NULL DEFAULT 0,
  status          text          NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','waived')),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  paid_at         timestamptz
);

ALTER TABLE public.pending_fees ENABLE ROW LEVEL SECURITY;

-- I venditori vedono solo le proprie quote
CREATE POLICY "pending_fees: seller read own"
  ON public.pending_fees FOR SELECT
  USING (seller_id = auth.uid());

-- L'admin vede tutto (policy separata, OR-ed con la precedente)
CREATE POLICY "pending_fees: admin read all"
  ON public.pending_fees FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- I venditori possono inserire le proprie quote (create automaticamente dal client)
CREATE POLICY "pending_fees: seller insert"
  ON public.pending_fees FOR INSERT
  WITH CHECK (seller_id = auth.uid());

-- Solo l'admin può aggiornare lo status (paid / waived)
CREATE POLICY "pending_fees: admin update"
  ON public.pending_fees FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Indice per queries frequenti
CREATE INDEX IF NOT EXISTS pending_fees_seller_idx  ON public.pending_fees (seller_id);
CREATE INDEX IF NOT EXISTS pending_fees_status_idx  ON public.pending_fees (status);
CREATE INDEX IF NOT EXISTS pending_fees_ref_idx     ON public.pending_fees (reference_id);
