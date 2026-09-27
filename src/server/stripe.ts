import "server-only";
import Stripe from "stripe";
import { backends } from "./env";

let client: Stripe | null = null;

/** Stripe, created on first use (never at build time). Null when not configured. */
export function stripe() {
  if (!backends.stripe) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
