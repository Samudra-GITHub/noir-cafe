import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, LOCALE_META, localePath } from "@/i18n/config";

const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/menu", priority: 0.9 },
  { path: "/reservation", priority: 0.9 },
  { path: "/locations", priority: 0.8 },
  { path: "/shop", priority: 0.8 },
  { path: "/story", priority: 0.6 },
  { path: "/brewing-lab", priority: 0.6 },
  { path: "/brewing-lab/studio", priority: 0.5 },
  { path: "/cup", priority: 0.5 },
  { path: "/concierge", priority: 0.5 },
  { path: "/order", priority: 0.7 },
];

const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Every route in every language, each entry listing its hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap(({ path, priority }) => {
    const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].intl, url(localePath(l, path))]));
    return LOCALES.map((locale) => ({
      url: url(localePath(locale, path)),
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages },
    }));
  });
}
