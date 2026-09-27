import { isSubscription, pushEnabled, removeSubscription, saveSubscription } from "@/server/push";
import { rateLimit } from "@/server/rate-limit";

/** POST { subscription } → store it · DELETE { endpoint } → forget it. */
export async function POST(request: Request) {
  if (!pushEnabled()) return Response.json({ error: "not_configured" }, { status: 501 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`push:${ip}`, { limit: 10, windowMs: 60 * 60_000 })) return Response.json({ error: "rate_limited" }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (!isSubscription(body?.subscription)) return Response.json({ error: "bad_request" }, { status: 400 });
  return Response.json(await saveSubscription(body.subscription));
}

export async function DELETE(request: Request) {
  if (!pushEnabled()) return Response.json({ error: "not_configured" }, { status: 501 });
  const body = await request.json().catch(() => null);
  if (typeof body?.endpoint !== "string") return Response.json({ error: "bad_request" }, { status: 400 });
  await removeSubscription(body.endpoint);
  return Response.json({ removed: true });
}
