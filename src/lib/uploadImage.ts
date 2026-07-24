import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

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

  // Read token directly from localStorage to avoid the supabase-js internal
  // mutex that can hang indefinitely on desktop Chrome/Firefox.
  const SUPABASE_URL_ENV = SUPABASE_URL;
  let accessToken: string | undefined;
  let tokenExpiresAt = 0;
  try {
    const projectRef = new URL(SUPABASE_URL_ENV).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (raw) {
      const parsed = JSON.parse(raw) as { access_token?: string; expires_at?: number };
      accessToken = parsed.access_token;
      tokenExpiresAt = parsed.expires_at ?? 0;
    }
  } catch {
    // localStorage not accessible — fall through to getSession()
  }

  // Refresh tokens that are missing or close to expiry. Without this check an
  // apparently logged-in user can receive a 401 from Storage after one hour.
  if (!accessToken || (tokenExpiresAt > 0 && tokenExpiresAt <= Math.floor(Date.now() / 1000) + 60)) {
    const sessionPromise = tokenExpiresAt > 0
      ? supabase.auth.refreshSession()
      : supabase.auth.getSession();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Verifica sessione scaduta — effettua di nuovo il login')), 10_000),
    );
    const { data: sessionData, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise,
    ]);
    if (sessionError) throw new Error(`Sessione non valida — ${sessionError.message}`);
    accessToken = sessionData?.session?.access_token;
  }

  if (!accessToken) {
    throw new Error('Sessione non trovata — effettua di nuovo il login');
  }

  // Use a direct fetch instead of the supabase-js storage client
  // to avoid the internal session-refresh hang that supabase-js can trigger
  const ANON_KEY = SUPABASE_ANON_KEY;
  const uploadUrl   = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const controller  = new AbortController();
  const timer       = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey':        ANON_KEY,
        'Content-Type':  'image/jpeg',
        'x-upsert':      'false',
      },
      body: compressed,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') {
      throw new Error('Upload timeout — connessione troppo lenta o bucket non raggiungibile');
    }
    throw err;
  }
  clearTimeout(timer);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg  = (body as { message?: string; error?: string }).message
              ?? (body as { message?: string; error?: string }).error
              ?? `HTTP ${response.status}`;
    console.error('[uploadImage] HTTP error:', response.status, body);
    throw new Error(msg);
  }

  onProgress?.(1);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
