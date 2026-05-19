import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set – ' +
    'running in offline / mock-data mode.'
  );
}

// Main client — handles auth (login / register / onAuthStateChange).
// It reads the stored session from localStorage and may trigger a token
// refresh on initialisation. Do NOT use it for public read-queries that
// should always work regardless of auth state.
export const supabase = createClient(url ?? '', key ?? '');

// Public read-only client — never touches localStorage, never waits for
// a session refresh.  Use this for loadCritical / loadDeferred so the
// app loads even when the stored session is expired and the refresh hangs.
export const supabasePublic = createClient(url ?? '', key ?? '', {
  auth: {
    persistSession:     false,
    autoRefreshToken:   false,
    detectSessionInUrl: false,
  },
});
