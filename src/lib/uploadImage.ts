import { supabase } from './supabase';

const BUCKET = 'debalage-images';

/**
 * Compress a File to JPEG using the Canvas API (no external deps).
 * Resizes so that neither dimension exceeds `maxDim`.
 */
async function compressToJpeg(file: File, maxDim: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context not available')); return; }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas.toBlob failed')),
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

export interface UploadOptions {
  /** Max side in pixels — defaults to 1200 */
  maxDim?: number;
  /** JPEG quality 0–1 — defaults to 0.82 */
  quality?: number;
  /** Storage sub-folder: 'products' | 'events' */
  folder: 'products' | 'events';
  /** Supabase user id — used as sub-folder for ownership policies */
  userId: string;
  /** Called with (0–1) as compression + upload progress */
  onProgress?: (progress: number) => void;
}

/**
 * Compress a file client-side, upload to Supabase Storage and return the
 * public URL. Throws on error.
 */
export async function uploadImage(file: File, opts: UploadOptions): Promise<string> {
  const { folder, userId, maxDim = 1200, quality = 0.82, onProgress } = opts;

  onProgress?.(0.1);

  const compressed = await compressToJpeg(file, maxDim, quality);

  onProgress?.(0.4);

  const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${userId}/${slug}.jpg`;

  // Race the upload against a 30-second timeout so it never hangs silently
  const uploadPromise = supabase.storage
    .from(BUCKET)
    .upload(path, compressed, { contentType: 'image/jpeg', upsert: false });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Upload timeout — controlla connessione e bucket Supabase')), 30_000),
  );

  const { error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    console.error('[uploadImage] Supabase Storage error:', error);
    // Surface the real Supabase message so it shows in the UI
    throw new Error((error as { message?: string }).message ?? String(error));
  }

  onProgress?.(1);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
