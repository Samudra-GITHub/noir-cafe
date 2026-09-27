"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { transitionFor } from "@/lib/transitions";

/**
 * TransitionDirector — chooses the cut for each navigation. On an in-app link
 * click it tags <html data-vt="…"> with the destination's transition and
 * records where the tap landed (--vt-x / --vt-y, the origin of the coffee
 * stain). Browser back/forward falls back to the blur dissolve. The tag is
 * cleared once the new page has settled.
 *
 * Also renders the stain ring: an invisible element with its own view-
 * transition name, whose transition group is painted as a spreading coffee
 * ring during a "stain" cut.
 */
export function TransitionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      root.dataset.vt = transitionFor(url.pathname);
      // Keyboard activation has no pointer position: bloom from the centre.
      const keyboard = e.detail === 0;
      root.style.setProperty("--vt-x", `${keyboard ? innerWidth / 2 : e.clientX}px`);
      root.style.setProperty("--vt-y", `${keyboard ? innerHeight / 2 : e.clientY}px`);
    };
    const onPop = () => (root.dataset.vt = "dissolve");
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // Clear the tag after the arrival has played.
  useEffect(() => {
    const t = window.setTimeout(() => delete document.documentElement.dataset.vt, 2500);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return <div aria-hidden className="vt-ring" />;
}
