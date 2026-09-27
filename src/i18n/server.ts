import type { Metadata } from "next";
import { lang } from "next/root-params";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, localePath, type Locale } from "./config";
import { DICTIONARIES } from "./dictionaries";
import { MESSAGES, translator } from "./messages";
import { SITE_URL } from "@/lib/seo";
import { SITE } from "@/constants/site";

/** The current route's locale (the `[lang]` root segment). */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary() {
  return DICTIONARIES[await getLocale()];
}

/** `tr` for server components: English source text in, current language out. */
export async function getTranslator() {
  return translator(MESSAGES[await getLocale()]);
}

type PageKey = keyof (typeof DICTIONARIES)["en"]["meta"]["pages"];

/** hreflang alternates for a path in every locale, plus x-default. */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].intl, `${SITE_URL}${localePath(l, path)}`])),
    "x-default": `${SITE_URL}${path}`,
  };
}

/**
 * Localized page metadata: title (through the root template), description,
 * canonical for this locale, hreflang alternates, Open Graph and Twitter.
 */
export async function localizedMetadata(page: PageKey | null, path: string, extra: Metadata = {}): Promise<Metadata> {
  const locale = await getLocale();
  const t = DICTIONARIES[locale].meta;
  const entry = page ? t.pages[page] : null;
  const title = entry?.title;
  const description = entry?.description || t.description;
  const url = `${SITE_URL}${localePath(locale, path)}`;
  const fullTitle = title ? `${title} · ${SITE.name}` : t.siteTitle;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      locale: LOCALE_META[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      title: fullTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    ...extra,
  };
}
