import "server-only";
import { backends } from "./env";
import { pushEnabled } from "./push";

/**
 * Every external provider in one table: what it powers, which environment
 * variables switch it on, and what the site does without it. Nothing is
 * required — with no keys at all the site runs complete, with each feature in
 * its labelled fallback. Values are never exposed; only whether they're set.
 */
export type Provider = {
  id: "supabase" | "clerk" | "stripe" | "resend" | "anthropic" | "push";
  name: string;
  powers: string;
  env: string[];
  fallback: string;
  configured: boolean;
};

const set = (...keys: string[]) => keys.every((k) => Boolean(process.env[k]));

export function providers(): Provider[] {
  return [
    {
      id: "supabase",
      name: "Supabase",
      powers: "Orders, live reservation availability, reviews, synced favourites, push subscriptions",
      env: ["SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)", "SUPABASE_SERVICE_ROLE_KEY"],
      fallback: "Orders are validated and priced but not stored (demo); availability uses default capacity; reviews accept demo submissions; favourites stay on the device",
      configured: backends.supabase,
    },
    {
      id: "clerk",
      name: "Clerk",
      powers: "Optional sign-in on /order; favourites follow the account",
      env: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
      fallback: "Guest ordering only",
      configured: backends.clerk,
    },
    {
      id: "stripe",
      name: "Stripe",
      powers: "Pay now with Checkout; the webhook marks orders paid",
      env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
      fallback: "Pay at pickup",
      configured: backends.stripe,
    },
    {
      id: "resend",
      name: "Resend",
      powers: "Reservation confirmation emails with a calendar invite",
      env: ["RESEND_API_KEY", "RESERVATIONS_FROM"],
      fallback: "The confirmation page and .ics download; no email is sent",
      configured: set("RESEND_API_KEY", "RESERVATIONS_FROM"),
    },
    {
      id: "anthropic",
      name: "Anthropic",
      powers: "The AI barista-concierge, grounded in the menu and cafés",
      env: ["ANTHROPIC_API_KEY", "CONCIERGE_MODEL (optional)"],
      fallback: "The concierge shows as resting",
      configured: set("ANTHROPIC_API_KEY"),
    },
    {
      id: "push",
      name: "Web Push (VAPID)",
      powers: "Opt-in notifications from the installed app",
      env: ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "PUSH_ADMIN_TOKEN"],
      fallback: "The notifications switch is hidden",
      configured: pushEnabled(),
    },
  ];
}
