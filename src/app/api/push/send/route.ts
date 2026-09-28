import { timingSafeEqual } from "node:crypto";
import { limited } from "@/server/rate-limit";
import { broadcast, pushEnabled } from "@/server/push";

/**
 * POST { title, body, url? } with `Authorization: Bearer <PUSH_ADMIN_TOKEN>`
 * → notifies every subscriber (the café's own tools only).
 */
export async function POST(request: Request) {
  // Blunts token guessing; the café's own tools send a handful a day.
  const busy = limited(request, "push-send", 20, 10 * 60_000);
  if (busy) return busy;
  const token = process.env.PUSH_ADMIN_TOKEN;
  if (!pushEnabled() || !token) return Response.json({ error: "not_configured" }, { status: 501 });
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const ok = given.length === token.length && timingSafeEqual(Buffer.from(given), Buffer.from(token));
  if (!ok) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.title !== "string" || typeof body?.body !== "string" || body.title.length > 120 || body.body.length > 400) return Response.json({ error: "bad_request" }, { status: 400 });
  // Same-origin paths only — "//host" would be protocol-relative.
  const url = typeof body.url === "string" && /^\/(?![/\\])/.test(body.url) ? body.url : "/";
  return Response.json(await broadcast({ title: body.title.slice(0, 80), body: body.body.slice(0, 240), url }));
}
