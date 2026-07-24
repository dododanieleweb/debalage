import { createClient } from '@supabase/supabase-js';

// La publishable key è progettata per essere inclusa nel client. La sicurezza
// dei dati è garantita dalle policy RLS, non dalla segretezza di questa chiave.
// Tenerla qui evita deploy costruiti con variabili Netlify obsolete o mancanti.
export const SUPABASE_URL = 'https://jrsbefallmiakxkdqxwe.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_q9YWFCnG19t3zYPnJJzJGw_Xm678b0o';

const url = SUPABASE_URL;
const key = SUPABASE_ANON_KEY;

// createClient richiede sempre URL e chiave non vuoti, anche quando il resto
// dell'app usa i dati mock. Questi valori locali evitano il crash iniziale;
// HAS_SUPABASE in AppContext continua a restare false senza variabili reali.
const clientUrl = url || 'http://127.0.0.1:54321';
const clientKey = key || 'offline-anon-key';
const projectRef = (() => {
  try { return new URL(clientUrl).hostname.split('.')[0]; }
  catch { return 'offline'; }
})();

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
export const supabase = createClient(clientUrl, clientKey);

// Public read-only client — never touches localStorage, never waits for
// a session refresh.  Use this for loadCritical / loadDeferred so the
// app loads even when the stored session is expired and the refresh hangs.
export const supabasePublic = createClient(clientUrl, clientKey, {
  auth: {
    // Deve essere diversa dalla chiave del client principale. Due GoTrueClient
    // sulla stessa chiave possono contendersi il lock e bloccare il login.
    storageKey:         `sb-${projectRef}-public-readonly`,
    persistSession:     false,
    autoRefreshToken:   false,
    detectSessionInUrl: false,
  },
});
