-- ============================================================
--  VintageHub – Seed Data (demo / development)
--  NOTE: Run AFTER schema.sql and AFTER creating a seller user
--        Replace <SELLER_UUID> with a real auth.users UUID.
-- ============================================================

-- Example: replace with the UUID of your test seller account
-- You can find it in Supabase → Authentication → Users

/*
insert into public.events (id, seller_id, title, description, type, status, date, time_start, time_end, city, address, image, products_count, featured)
values
  ('evt_demo_1', '<SELLER_UUID>', 'Vendita Privata in Villa',
   'Una selezione esclusiva di mobili e oggetti d''arredo degli anni ''50–''70, direttamente da una residenza privata fiorentina.',
   'casa_privata', 'upcoming', '2026-06-14', '10:00', '18:00',
   'Firenze', 'Via dei Servi 14, 50122 Firenze FI',
   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop',
   42, true),

  ('evt_demo_2', '<SELLER_UUID>', 'Mercatino del Vintage – Pigneto',
   'Il mercatino di quartiere torna con 30+ espositori. Abbigliamento, dischi, libri, oggettistica.',
   'mercatino', 'upcoming', '2026-06-21', '09:00', '19:00',
   'Roma', 'Piazza del Pigneto, 00176 Roma RM',
   'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=500&fit=crop',
   120, true);

insert into public.products (id, seller_id, event_id, title, description, category, condition, era, price, images, featured, status)
values
  ('prod_demo_1', '<SELLER_UUID>', 'evt_demo_1',
   'Poltrona Arflex anni ''60',
   'Poltrona in tessuto originale ocra, struttura in legno di faggio. Perfetta per un salotto moderno.',
   'Mobili & Design', 'excellent', 'Anni ''60', 380,
   ARRAY['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop'],
   true, 'available'),

  ('prod_demo_2', '<SELLER_UUID>', 'evt_demo_1',
   'Servizio da tè Richard Ginori',
   'Servizio completo per 6 persone, decoro floreale blu cobalto. Condizioni eccellenti.',
   'Ceramica & Porcellana', 'excellent', 'Anni ''50', 220,
   ARRAY['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop'],
   true, 'available'),

  ('prod_demo_3', '<SELLER_UUID>', 'evt_demo_2',
   'Giubbotto in pelle vintage '70s',
   'Giacca in vera pelle marrone, fodera originale, taglia M/L. Portata pochissimo.',
   'Abbigliamento', 'good', 'Anni ''70', 145,
   ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop'],
   true, 'available');
*/

-- Once you've replaced <SELLER_UUID>, uncomment the blocks above and run.
select 'Seed file ready — replace <SELLER_UUID> and uncomment the inserts.' as info;
