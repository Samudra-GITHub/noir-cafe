/**
 * Locales — English is the default and lives at unprefixed URLs (/menu);
 * the others are reachable at /ja, /fr, /it and remembered in a cookie so
 * internal links can stay unprefixed (src/proxy.ts rewrites them).
 *
 * RTL-ready: every locale declares its direction and the root layout sets
 * `dir`; layout CSS uses logical properties (ms/me, ps/pe, text-start…), so
 * adding an RTL language is a dictionary + one entry here.
 */
export const LOCALES = ["en", "ja", "fr", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "noir-locale";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const LOCALE_META: Record<Locale, { name: string; intl: string; og: string; dir: "ltr" | "rtl" }> = {
  en: { name: "English", intl: "en-US", og: "en_US", dir: "ltr" },
  ja: { name: "日本語", intl: "ja-JP", og: "ja_JP", dir: "ltr" },
  fr: { name: "Français", intl: "fr-FR", og: "fr_FR", dir: "ltr" },
  it: { name: "Italiano", intl: "it-IT", og: "it_IT", dir: "ltr" },
};

/** Prices are set and charged in US dollars; other currencies are an approximate display only. */
export const DISPLAY_CURRENCIES = ["USD", "EUR", "JPY", "GBP"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];
export const BASE_CURRENCY: DisplayCurrency = "USD";
export const CURRENCY_STORAGE = "noir:currency";

/** Public path for a locale: English unprefixed, others under /xx. Already-prefixed paths are left alone. */
export function localePath(locale: Locale, path: string) {
  if (locale === DEFAULT_LOCALE || isLocale(path.split("/")[1])) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Strip a locale prefix: "/ja/menu" → "/menu". */
export function stripLocale(pathname: string) {
  const seg = pathname.split("/")[1];
  if (!isLocale(seg)) return pathname;
  const rest = pathname.slice(seg.length + 1);
  return rest === "" ? "/" : rest;
}

/** First supported language in an Accept-Language header, by quality. */
export function negotiate(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((x) => x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) if (isLocale(lang)) return lang;
  return null;
}
