import "server-only";

/**
 * Which backends are configured. Every integration is optional: without its
 * keys a feature degrades (demo orders, pay at pickup, device-only favourites)
 * and says so in the UI. Secrets are read here only, on the server.
 */
export const backends = {
  supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  clerk: Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
};

/** Absolute origin for redirect URLs (Stripe success/cancel). */
export function siteOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}
