import { backends } from "@/server/env";
import { supabase } from "@/server/supabase";

/**
 * GET → what the order page can offer right now:
 *   unavailable  item slugs sold out today (Supabase `menu_availability`)
 *   card         Stripe checkout is configured
 *   accounts     sign-in (Clerk) is configured
 *   persisted    orders are stored (Supabase)
 * Without Supabase, availability is simply "everything on the menu".
 */
export async function GET() {
  let unavailable: string[] = [];
  let source: "supabase" | "menu" = "menu";
  const db = supabase();
  if (db) {
    const { data, error } = await db.from("menu_availability").select("slug").eq("available", false);
    if (!error && data) {
      unavailable = data.map((r) => r.slug as string);
      source = "supabase";
    }
  }
  return Response.json(
    { unavailable, source, card: backends.stripe, accounts: backends.clerk, persisted: backends.supabase, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
