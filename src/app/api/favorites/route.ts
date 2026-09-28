import { limited } from "@/server/rate-limit";
import { ITEMS_BY_SLUG, sanitize } from "@/data/ordering";
import { currentUserId } from "@/server/auth";
import { backends } from "@/server/env";
import { supabase } from "@/server/supabase";

/**
 * Favourites synced to the guest's account (Clerk + Supabase table
 * `favorites`). Without both, the route answers 501 and the order page keeps
 * favourites on the device instead.
 *
 *   GET → { favorites: [{ slug, modifiers }] }
 *   PUT { favorites: [...] } → replaces the list (max 24)
 */
async function guard() {
  if (!backends.clerk || !backends.supabase) return { error: Response.json({ error: "not_configured" }, { status: 501 }) };
  const userId = await currentUserId();
  if (!userId) return { error: Response.json({ error: "sign_in_required" }, { status: 401 }) };
  return { userId, db: supabase()! };
}

export async function GET() {
  const g = await guard();
  if ("error" in g) return g.error;
  const { data, error } = await g.db.from("favorites").select("slug, modifiers").eq("user_id", g.userId).order("position");
  if (error) return Response.json({ error: "unavailable" }, { status: 503 });
  return Response.json({ favorites: data });
}

export async function PUT(request: Request) {
  const busy = limited(request, "favorites", 30, 60_000);
  if (busy) return busy;
  const g = await guard();
  if ("error" in g) return g.error;
  let list: unknown;
  try {
    list = (await request.json())?.favorites;
  } catch {}
  if (!Array.isArray(list)) return Response.json({ error: "bad_request" }, { status: 400 });
  const rows = list
    .slice(0, 24)
    .map((f: { slug?: unknown; modifiers?: unknown }, position) => {
      const item = typeof f?.slug === "string" ? ITEMS_BY_SLUG.get(f.slug) : undefined;
      return item ? { user_id: g.userId, slug: item.slug, modifiers: sanitize(item, f.modifiers), position } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  await g.db.from("favorites").delete().eq("user_id", g.userId);
  if (rows.length) {
    const { error } = await g.db.from("favorites").insert(rows);
    if (error) return Response.json({ error: "unavailable" }, { status: 503 });
  }
  return Response.json({ favorites: rows.map((r) => ({ slug: r.slug, modifiers: r.modifiers })) });
}
