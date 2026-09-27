import { BASE_CURRENCY, LOCALE_META, type DisplayCurrency, type Locale } from "./config";

/** Replace `{name}` placeholders. Unknown names are left visible so gaps show up in QA. */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

const cache = new Map<string, Intl.NumberFormat>();
function numberFormat(locale: Locale, currency: string, whole: boolean) {
  const key = `${locale}|${currency}|${whole}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE_META[locale].intl, {
      style: "currency",
      currency,
      ...(whole ? { maximumFractionDigits: 0, minimumFractionDigits: 0 } : {}),
    });
    cache.set(key, f);
  }
  return f;
}

export type Rates = { date: string; rates: Partial<Record<DisplayCurrency, number>> };

/**
 * Format a US-dollar amount. In English with USD this is exactly the site's
 * original "$6.50" / "$22". With another display currency and a known rate,
 * the converted amount is marked approximate ("≈ ¥1,025"); prices are still
 * charged in USD.
 */
export function formatMoney(
  usd: number,
  locale: Locale,
  { whole = false, currency = BASE_CURRENCY, rates }: { whole?: boolean; currency?: DisplayCurrency; rates?: Rates | null } = {},
) {
  const rate = currency === BASE_CURRENCY ? null : rates?.rates[currency];
  if (!rate) return numberFormat(locale, BASE_CURRENCY, whole).format(whole ? Math.round(usd) : usd);
  return `≈ ${numberFormat(locale, currency, whole || currency === "JPY").format(usd * rate)}`;
}

/**
 * A wall-clock time ("10:30"). English keeps the site's original "10:30 AM"
 * (a plain space, not ICU's narrow one); other locales use Intl.
 */
export function formatTime(hhmm: string, locale: Locale) {
  const [h, m] = hhmm.split(":").map(Number);
  if (locale === "en") return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 5, h, m)));
}

/** Weekday, month and day — "Friday, October 16". */
export const LONG_DATE: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };

export function formatDate(date: Date, locale: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, options).format(date);
}
