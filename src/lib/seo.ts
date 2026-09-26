import type { Metadata } from "next";
import { SITE } from "@/constants/site";

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.noircafe.com). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const DEFAULT_DESCRIPTION =
  "Sourced with patience, roasted with restraint, and poured as a small act of attention. Specialty coffee in SoHo, Brooklyn and the West Village.";

/**
 * Per-route metadata: title (through the root template), description,
 * canonical URL, Open Graph and Twitter card. Each route's
 * opengraph-image.tsx supplies the share image automatically.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — Specialty coffee, New York`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      locale: "en_US",
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
