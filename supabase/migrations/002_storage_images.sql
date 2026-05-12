-- ============================================================
-- Migration 002 — Storage bucket for user-uploaded images
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create the storage bucket (public so images are readable without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('debalage-images', 'debalage-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. RLS policies on storage.objects
-- Path convention: {folder}/{userId}/{slug}.jpg
--   e.g. products/abc-123/1714000000000-x4fg2k.jpg
--        events/abc-123/1714000000001-z9mn7r.jpg
-- ============================================================

-- Allow anyone to read (because the bucket is public)
CREATE POLICY "Public can read debalage-images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'debalage-images' );

-- Allow authenticated users to upload ONLY to their own sub-folder
-- (storage.foldername returns an array of path segments, 1-indexed in Postgres)
CREATE POLICY "Authenticated users upload own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'debalage-images'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to delete their own files
CREATE POLICY "Authenticated users delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'debalage-images'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- (Optional) Allow users to overwrite/update their own files
CREATE POLICY "Authenticated users update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'debalage-images'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'debalage-images'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
