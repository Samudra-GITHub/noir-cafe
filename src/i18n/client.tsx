"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  BASE_CURRENCY,
  CURRENCY_STORAGE,
  DISPLAY_CURRENCIES,
  LOCALE_COOKIE,
  localePath,
  stripLocale,
  type DisplayCurrency,
  type Locale,
} from "./config";
import { track } from "@/lib/analytics";
import type { ClientDictionary } from "./client-dictionary";
import { fill, formatDate, formatMoney, formatTime, type Rates } from "./format";
import { translator, type Messages, type Translate } from "./translate";

type I18n = { locale: Locale; t: ClientDictionary; tr: Translate };
const I18nContext = createContext<I18n | null>(null);

/** `messages` is the current locale's content table (empty for English). */
export function I18nProvider({ locale, t, messages, children }: { locale: Locale; t: ClientDictionary; messages: Messages; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t, tr: translator(messages) }), [locale, t, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside I18nProvider");
  return ctx;
}

/** The app path without its locale prefix ("/ja/menu" → "/menu"). */
export function usePagePath() {
  return stripLocale(usePathname());
}

/** Build an href in the current locale. */
export function useLocalizedHref() {
  const { locale } = useI18n();
  return useCallback((path: string) => (path.startsWith("/") ? localePath(locale, path) : path), [locale]);
}

/** Switch language: remember the choice and load the page in that locale. */
export function switchLocale(next: Locale, path: string) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax${secure}`;
  track("language_changed", { language: next });
  window.location.assign(localePath(next, path));
}

// ── Display currency (per viewer, persisted) ───────────────────────────────
const currencyListeners = new Set<() => void>();
function readCurrency(): DisplayCurrency {
  try {
    const v = localStorage.getItem(CURRENCY_STORAGE);
    if (v && (DISPLAY_CURRENCIES as readonly string[]).includes(v)) return v as DisplayCurrency;
  } catch {}
  return BASE_CURRENCY;
}
export function setCurrency(next: DisplayCurrency) {
  try {
    localStorage.setItem(CURRENCY_STORAGE, next);
  } catch {}
  track("currency_changed", { currency: next });
  currencyListeners.forEach((l) => l());
}
function subscribeCurrency(cb: () => void) {
  currencyListeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === CURRENCY_STORAGE && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    currencyListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
export function useCurrency() {
  return useSyncExternalStore(subscribeCurrency, readCurrency, () => BASE_CURRENCY);
}

// Reference rates — fetched once per session from /api/currency, only when a non-USD currency is chosen.
let rates: Rates | null = null;
let ratesRequest: Promise<void> | null = null;
const rateListeners = new Set<() => void>();
function loadRates() {
  ratesRequest ??= fetch("/api/currency")
    .then((r) => (r.ok ? (r.json() as Promise<Rates>) : null))
    .then((data) => {
      rates = data;
      rateListeners.forEach((l) => l());
    })
    .catch(() => {});
  return ratesRequest;
}
export function useRates() {
  const currency = useCurrency();
  useEffect(() => {
    if (currency !== BASE_CURRENCY) void loadRates();
  }, [currency]);
  return useSyncExternalStore(
    (cb) => {
      rateListeners.add(cb);
      return () => rateListeners.delete(cb);
    },
    () => rates,
    () => null,
  );
}

/** Money and date formatting in the current locale and display currency. */
export function useFormat() {
  const { locale } = useI18n();
  const currency = useCurrency();
  const r = useRates();
  return useMemo(
    () => ({
      /** A US-dollar amount (e.g. 6.5). */
      price: (usd: number, whole = false) => formatMoney(usd, locale, { whole, currency, rates: r }),
      /** Cents (the ordering model). */
      money: (cents: number) => formatMoney(cents / 100, locale, { currency, rates: r }),
      /** Always in USD — for what is actually charged. */
      usd: (usd: number) => formatMoney(usd, locale),
      date: (d: Date, options: Intl.DateTimeFormatOptions) => formatDate(d, locale, options),
      /** "10:30" → the local way to say it ("10:30 AM" in English, "10:30" in French…). */
      time: (hhmm: string) => formatTime(hhmm, locale),
      fill,
    }),
    [locale, currency, r],
  );
}
