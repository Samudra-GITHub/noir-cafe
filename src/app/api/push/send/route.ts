import { timingSafeEqual } from "node:crypto";
import { broadcast, pushEnabled } from "@/server/push";

/**
 * POST { title, body, url? } with `Authorization: Bearer <PUSH_ADMIN_TOKEN>`
 * → notifies every subscriber (the café's own tools only).
 */
export async function POST(request: Request) {
  const token = process.env.PUSH_ADMIN_TOKEN;
  if (!pushEnabled() || !token) return Response.json({ error: "not_configured" }, { status: 501 });
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const ok = given.length === token.length && timingSafeEqual(Buffer.from(given), Buffer.from(token));
  if (!ok) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.title !== "string" || typeof body?.body !== "string") return Response.json({ error: "bad_request" }, { status: 400 });
  const url = typeof body.url === "string" && body.url.startsWith("/") ? body.url : "/";
  return Response.json(await broadcast({ title: body.title.slice(0, 80), body: body.body.slice(0, 240), url }));
}
