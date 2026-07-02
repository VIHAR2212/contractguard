// ===========================================================================
// /lib/supabase/client.ts
// ---------------------------------------------------------------------------
// Lazy Supabase client. Only instantiated if NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY are set. Without them, the rules-loader
// and rulebooks loader silently fall back to local-only mode.
// ===========================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _checked = false;

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient | null {
  if (_checked) return _client;
  _checked = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  try {
    _client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    return _client;
  } catch (err) {
    console.error("[supabase] failed to create client:", err);
    return null;
  }
}
