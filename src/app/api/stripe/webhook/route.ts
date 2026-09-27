import { markOrderPaid } from "@/server/orders";
import { stripe } from "@/server/stripe";

/**
 * Stripe webhook — marks orders paid when Checkout completes. The signature
 * is verified against STRIPE_WEBHOOK_SECRET with the raw request body.
 */
export async function POST(request: Request) {
  const pay = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!pay || !secret) return Response.json({ error: "not_configured" }, { status: 501 });
  if (!signature) return Response.json({ error: "missing_signature" }, { status: 400 });

  let event;
  try {
    event = await pay.webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch {
    return Response.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.order_id) await markOrderPaid(session.metadata.order_id);
  }
  return Response.json({ received: true });
}
