import { createClient } from '@supabase/supabase-js';

// Sanitize env values: trim whitespace and drop any non-printable / non-ASCII
// characters. Without this, a stray smart-quote, BOM, or zero-width space in
// a GitHub Actions secret causes the browser to reject the apikey header with
// "String contains non ISO-8859-1 code point" — the failure mode is invisible
// because the bad char doesn't render in the secret editor.
function clean(v) {
  if (v == null) return '';
  return String(v).trim().replace(/[^\x20-\x7E]/g, '');
}

const url = clean(import.meta.env.VITE_SUPABASE_URL);
const anonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Surface obvious config errors in the console so they show up in DevTools
// instead of as cryptic fetch failures.
if (!url || !anonKey) {
  console.error('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.');
} else if (anonKey.split('.').length !== 3) {
  console.error('[supabase] VITE_SUPABASE_ANON_KEY does not look like a JWT (should be 3 dot-separated parts).');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
