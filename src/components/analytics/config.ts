import "server-only";

export type AnalyticsConfig = {
  vercel: boolean;
  plausible: { domain: string; src: string } | null;
  ga: string | null;
};

/** Which analytics providers are configured. Nothing here is secret. */
export function analyticsConfig(): AnalyticsConfig | null {
  const vercel = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1";
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  if (!vercel && !domain && !ga) return null;
  return {
    vercel,
    plausible: domain ? { domain, src: process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js" } : null,
    ga: ga && /^G-[A-Z0-9]+$/.test(ga) ? ga : null,
  };
}
