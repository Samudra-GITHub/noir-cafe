import { currentUserId } from "@/server/auth";
import { siteOrigin } from "@/server/env";
import { saveOrder, validateOrder } from "@/server/orders";
import { rateLimit } from "@/server/rate-limit";
import { stripe } from "@/server/stripe";

/**
 * POST { cafeId, pickupAt, name, lines: [{ slug, quantity, modifiers }], payment: "pickup" | "card" }
 *
 * Validates the café, the pickup slot and every line against the menu, and
 * prices the order on the server. "pickup" → the order is placed (paid at the
 * counter). "card" → the order is saved as awaiting payment and a Stripe
 * Checkout session is returned (only when Stripe is configured).
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`orders:${ip}`, { limit: 12, windowMs: 10 * 60_000 })) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const payment = body.payment === "card" ? "card" : "pickup";
  const result = validateOrder(body);
  if ("error" in result) return Response.json({ error: result.error }, { status: 422 });

  const pay = payment === "card" ? stripe() : null;
  if (payment === "card" && !pay) return Response.json({ error: "card_unavailable" }, { status: 400 });

  const record = await saveOrder(result.order, { userId: await currentUserId(), payment });

  if (pay) {
    const origin = siteOrigin(request);
    const session = await pay.checkout.sessions.create({
      mode: "payment",
      line_items: record.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "usd",
          unit_amount: l.unitCents,
          product_data: { name: l.name, ...(l.detail ? { description: l.detail } : {}) },
        },
      })),
      metadata: { order_id: record.id, number: record.number, cafe: record.cafeName, pickup_at: record.pickupAt },
      success_url: `${origin}/order/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order`,
    });
    return Response.json({ order: record, checkoutUrl: session.url });
  }
  return Response.json({ order: record });
}
