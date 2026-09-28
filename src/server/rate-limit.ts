import "server-only";

/**
 * A small fixed-window rate limiter, in memory. On serverless platforms each
 * instance keeps its own window, so this is a courtesy limit that blunts
 * accidental floods; put a shared store (e.g. Upstash, Vercel KV) behind the
 * same function for a hard, global limit.
 */
const windows = new Map<string, { start: number; count: number }>();

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now - w.start > windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 5000) {
      for (const [k, v] of windows) if (now - v.start > windowMs) windows.delete(k);
    }
    return true;
  }
  w.count++;
  return w.count <= limit;
}

/** The visitor's address as the platform reports it (Vercel sets x-forwarded-for). */
export function clientKey(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}

/**
 * Route-handler guard: `null` when the request may proceed, otherwise a 429
 * with Retry-After. `const busy = limited(request, "name", 30, 60_000); if (busy) return busy;`
 */
export function limited(request: Request, name: string, limit: number, windowMs: number): Response | null {
  if (rateLimit(`${name}:${clientKey(request.headers)}`, { limit, windowMs })) return null;
  return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } });
}
