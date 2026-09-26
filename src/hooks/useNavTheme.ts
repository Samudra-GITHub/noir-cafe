"use client";

import { useEffect, useState } from "react";

export type NavTheme = "dark" | "light";

/**
 * Reads the `data-nav-theme` of whatever section currently sits beneath the
 * navigation bar, so the glass nav turns dark over imagery and light over paper.
 * Page sections without the attribute count as "light". When sections overlap
 * (the sticky hero sits beneath the content that scrolls over it) the later
 * one in document order wins, because it paints on top.
 * `routeKey` re-runs detection after client-side navigation; `initial` is what
 * the server renders (dark for routes that open on a hero film) so hydration
 * never repaints the bar.
 */
export function useNavTheme(probeY: number, routeKey: string, initial: NavTheme = "light"): NavTheme {
  const [theme, setTheme] = useState<NavTheme>(initial);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const sections = document.querySelectorAll<HTMLElement>(
        "main section, footer, [data-nav-theme]",
      );
      let next: NavTheme = "light";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          next = section.dataset.navTheme === "dark" ? "dark" : "light";
        }
      }
      setTheme(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [probeY, routeKey]);

  return theme;
}
