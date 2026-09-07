import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error('Missing Supabase env vars — copy .env.example to .env and fill in your project URL/key.');
}

export const supabase = createClient(url, anonKey);
