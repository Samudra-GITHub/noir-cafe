import { providers } from "@/server/providers";

/**
 * GET → { ok, providers: { supabase: true, … } } — which integrations are
 * switched on, for deploy checks. Reports only whether keys are set, never
 * their values.
 */
export async function GET() {
  const status = Object.fromEntries(providers().map((p) => [p.id, p.configured]));
  return Response.json({ ok: true, providers: status }, { headers: { "Cache-Control": "no-store" } });
}
