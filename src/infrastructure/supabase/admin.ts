import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase con la SECRET KEY: ignora RLS. Solo para el servidor
// (API routes / webhooks). Nunca importarlo desde un componente del navegador.

let cached: SupabaseClient | null | undefined;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey || secretKey.startsWith("pega_aqui") || secretKey.startsWith("tu_")) {
    cached = null;
    return cached;
  }

  cached = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
