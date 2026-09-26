"use client";

import { useEffect, useState } from "react";

/**
 * Scrollspy — returns the id of the section currently crossing the reading
 * line (40% down the viewport). Sections are looked up by id.
 */
export function useScrollSpy(ids: readonly string[], line = 0.4) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: `-${line * 100}% 0px -${(1 - line) * 100 - 1}% 0px` },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [ids, line]);

  return active;
}
