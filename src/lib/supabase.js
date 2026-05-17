import { createClient } from '@supabase/supabase-js';

// Public Supabase project credentials.
//
// The anon key is *intentionally* public — it ships in the JS bundle on every
// page load and is meant to be visible. Real protection comes from the RLS
// policies in supabase/migrations/0007_nexus_dashboard.sql, not from hiding
// this string. So we hardcode it here as a default and treat the GitHub
// Actions secret as an optional override.
//
// Why hardcode the default? Because pasting the key into a GitHub secret
// field can silently corrupt it (smart quotes, BOM, zero-width spaces),
// producing the cryptic "String contains non ISO-8859-1 code point" fetch
// error. Hardcoding eliminates that failure mode entirely.
const DEFAULT_URL = 'https://oenxmoteyqhjpvrywxli.supabase.co';
const DEFAULT_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbnhtb3RleXFoanB2cnl3eGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDQ2NzUsImV4cCI6MjA5MjkyMDY3NX0.2u0Qp2jSEK8UQokh_VZe3v_YisnPK-eSd87oaCSTvIQ';

// Strip whitespace + non-printable / non-ASCII chars to defeat the most
// common corruption modes from copy/paste.
function clean(v) {
  if (v == null) return '';
  return String(v).trim().replace(/[^\x20-\x7E]/g, '');
}

// Use the env var only if it survives cleaning AND looks like a JWT (3 dot
// parts). Otherwise fall back to the hardcoded default so a broken secret
// can't override a working bundle.
function pick(envValue, fallback, validator) {
  const cleaned = clean(envValue);
  if (cleaned && (!validator || validator(cleaned))) return cleaned;
  return fallback;
}

const url = pick(import.meta.env.VITE_SUPABASE_URL, DEFAULT_URL, (v) => v.startsWith('https://'));
const anonKey = pick(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  DEFAULT_ANON,
  (v) => v.split('.').length === 3
);

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
