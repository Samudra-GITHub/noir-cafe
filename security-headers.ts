/**
 * Response security headers and the Content-Security-Policy.
 *
 * Pages are prerendered, so the policy is static (no per-request nonce, which
 * would force dynamic rendering): scripts are limited to this origin plus
 * Next's own inline bootstrap, JSON-LD and the atmosphere boot script. Each
 * third party is allowed only when its integration is configured, so a site
 * without keys ships the tightest policy. See docs/security.md.
 */

const dev = process.env.NODE_ENV === "development";
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const https = site.startsWith("https://");

/** Clerk's Frontend API host is encoded in the publishable key: pk_<env>_<base64("host$")>. */
function clerkHost(): string | null {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key || !process.env.CLERK_SECRET_KEY) return null;
  try {
    const host = Buffer.from(key.split("_")[2] ?? "", "base64").toString("utf8").replace(/\$$/, "");
    return /^[a-z0-9.-]+$/i.test(host) ? `https://${host}` : null;
  } catch {
    return null;
  }
}

export function contentSecurityPolicy(): string {
  const clerk = clerkHost();
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? new URL(process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js").origin : null;
  const ga = Boolean(process.env.NEXT_PUBLIC_GA_ID);
  const GA = ["https://*.googletagmanager.com", "https://*.google-analytics.com", "https://*.analytics.google.com"];

  const directives: Record<string, (string | null | false)[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", dev && "'unsafe-eval'", clerk, clerk && "https://challenges.cloudflare.com", plausible, ga && "https://www.googletagmanager.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:", clerk && "https://img.clerk.com", ...(ga ? GA : [])],
    "media-src": ["'self'", "blob:"],
    "connect-src": ["'self'", dev && "ws:", clerk, clerk && "https://clerk-telemetry.com", plausible, ...(ga ? GA : [])],
    "frame-src": [clerk ? clerk : "'none'", clerk && "https://challenges.cloudflare.com"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([k, v]) => `${k} ${v.filter(Boolean).join(" ")}`);
  if (https) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function securityHeaders() {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Location is asked for on /locations (nearest café); motion sensors drive the 3D cup's tilt.
    { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), interest-cohort=(), browsing-topics=(), geolocation=(self), accelerometer=(self), gyroscope=(self)" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  ];
}
