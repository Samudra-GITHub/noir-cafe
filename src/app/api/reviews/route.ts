import { rateLimit } from "@/server/rate-limit";
import { isProduct, listReviews, submitReview, validateReview } from "@/server/reviews";

/**
 *   GET  ?product=slug → { reviews, count, average } — approved reviews only
 *   POST { product, name, rating 1–5, body } → queued for moderation
 */
export async function GET(request: Request) {
  const product = new URL(request.url).searchParams.get("product") ?? "";
  if (!isProduct(product)) return Response.json({ error: "unknown_product" }, { status: 404 });
  return Response.json(await listReviews(product), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`reviews:${ip}`, { limit: 5, windowMs: 60 * 60_000 })) return Response.json({ error: "rate_limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const result = validateReview(body);
  if ("error" in result) return Response.json({ error: result.error }, { status: 422 });
  const { stored } = await submitReview(result.review);
  return Response.json({ status: "pending", stored });
}
