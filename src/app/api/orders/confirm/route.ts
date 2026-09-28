import { limited } from "@/server/rate-limit";
import { stripe } from "@/server/stripe";

/** GET ?session_id= → the paid order's summary after Stripe Checkout returns. */
export async function GET(request: Request) {
  const busy = limited(request, "orders-confirm", 30, 10 * 60_000);
  if (busy) return busy;
  const id = new URL(request.url).searchParams.get("session_id");
  const pay = stripe();
  if (!pay) return Response.json({ error: "card_unavailable" }, { status: 400 });
  if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return Response.json({ error: "bad_request" }, { status: 400 });
  try {
    const session = await pay.checkout.sessions.retrieve(id);
    return Response.json({
      paid: session.payment_status === "paid",
      number: session.metadata?.number,
      cafe: session.metadata?.cafe,
      pickupAt: session.metadata?.pickup_at,
      totalCents: session.amount_total,
    });
  } catch {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
}
