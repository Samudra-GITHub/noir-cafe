import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { backends } from "./env";

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client (service role — bypasses row-level security,
 * so it never leaves the server). Null when Supabase isn't configured.
 * Schema: supabase/migrations.
 */
export function supabase() {
  if (!backends.supabase) return null;
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
