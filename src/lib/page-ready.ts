/**
 * Page-readiness signals for deferring non-critical work (films, the motion
 * runtime) until the first paint is on screen — however slowly it arrives.
 * Client-only; each resolves once and is shared.
 */

let painted: Promise<void> | null = null;
let loaded: Promise<void> | null = null;

/** Resolves after first-contentful-paint (or after 4s without Paint Timing). */
export function whenPainted() {
  painted ??= new Promise<void>((resolve) => {
    if (performance.getEntriesByName("first-contentful-paint").length) return resolve();
    window.setTimeout(resolve, 4000);
    try {
      const observer = new PerformanceObserver((list) => {
        if (!list.getEntriesByName("first-contentful-paint").length) return;
        observer.disconnect();
        resolve();
      });
      observer.observe({ type: "paint", buffered: true });
    } catch {
      resolve();
    }
  });
  return painted;
}

/** Resolves after the window load event. */
export function whenLoaded() {
  loaded ??= new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });
  return loaded;
}

/** Resolves when the browser next has idle time (setTimeout fallback). */
export function whenIdle(timeout = 2000) {
  return new Promise<void>((resolve) => {
    if (window.requestIdleCallback) window.requestIdleCallback(() => resolve(), { timeout });
    else window.setTimeout(resolve, 200);
  });
}
