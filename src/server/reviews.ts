import "server-only";
import { HOME_RITUAL_SET, PRODUCTS } from "@/data/shop";
import { supabase } from "./supabase";

/**
 * Product reviews. Only real reviews are ever shown: they come from the
 * Supabase `reviews` table and appear once approved by the café. New reviews
 * arrive as "pending". Without Supabase there are simply no reviews — the
 * product page says so and still accepts a (demo) submission.
 */
export type Review = { id: string; name: string; rating: number; body: string; createdAt: string };
export type ReviewSummary = { reviews: Review[]; count: number; average: number | null; source: "supabase" | "none" };

const SLUGS = new Set([...PRODUCTS, HOME_RITUAL_SET].map((p) => p.slug));

export const isProduct = (slug: string) => SLUGS.has(slug);

export async function listReviews(product: string): Promise<ReviewSummary> {
  const db = supabase();
  if (!db) return { reviews: [], count: 0, average: null, source: "none" };
  const { data, error } = await db
    .from("reviews")
    .select("id, guest_name, rating, body, created_at")
    .eq("product", product)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return { reviews: [], count: 0, average: null, source: "supabase" };
  const reviews = data.map((r) => ({ id: r.id as string, name: r.guest_name as string, rating: r.rating as number, body: r.body as string, createdAt: r.created_at as string }));
  const average = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;
  return { reviews, count: reviews.length, average, source: "supabase" };
}

export function validateReview(body: unknown): { review: { product: string; name: string; rating: number; body: string } } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const product = typeof b.product === "string" ? b.product : "";
  if (!isProduct(product)) return { error: "unknown_product" };
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "rating_invalid" };
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 60) : "";
  if (!name) return { error: "name_required" };
  const text = typeof b.body === "string" ? b.body.trim() : "";
  if (text.length < 10 || text.length > 800) return { error: "body_length" };
  return { review: { product, name, rating, body: text } };
}

/** Queue a review for moderation. Returns whether it was stored. */
export async function submitReview(r: { product: string; name: string; rating: number; body: string }) {
  const db = supabase();
  if (!db) return { stored: false };
  const { error } = await db.from("reviews").insert({ product: r.product, guest_name: r.name, rating: r.rating, body: r.body, status: "pending" });
  if (error) throw new Error(`reviews insert: ${error.message}`);
  return { stored: true };
}
