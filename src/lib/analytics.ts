/**
 * Analytics hooks. `track()` forwards a named event to whichever providers
 * are loaded (Vercel Web Analytics, Plausible, Google Analytics 4) and is a
 * no-op when none are — which is the default: each provider stays off until
 * its environment variable is set (see .env.example), and all of them stand
 * down for visitors who send Global Privacy Control or Do Not Track.
 *
 * Events carry no personal data: names and coarse, non-identifying props only.
 */

export type AnalyticsEvent =
  | "reservation_confirmed"
  | "order_placed"
  | "newsletter_subscribed"
  | "language_changed"
  | "currency_changed"
  | "app_installed";

type Props = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
  plausible?: (name: string, options?: { props?: Props }) => void;
  gtag?: (command: "event", name: string, params?: Props) => void;
  va?: (event: "event", payload: { name: string; data?: Props }) => void;
};

/** True when the visitor has asked not to be tracked. */
export function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

export function track(name: AnalyticsEvent, props?: Props) {
  if (typeof window === "undefined" || optedOut()) return;
  const w = window as AnalyticsWindow;
  try {
    w.plausible?.(name, props ? { props } : undefined);
    w.gtag?.("event", name, props);
    w.va?.("event", { name, data: props });
  } catch {
    // Analytics must never break the page.
  }
}
