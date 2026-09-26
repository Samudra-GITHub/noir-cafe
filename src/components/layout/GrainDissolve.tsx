"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * GrainDissolve — on every client-side route change, a veil of paper grain
 * and soft blur washes over the viewport and fades away while the view
 * transition crossfades the page beneath it. Skipped on first load and under
 * reduced motion (via CSS).
 */
export function GrainDissolve() {
  const pathname = usePathname();
  const first = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = requestAnimationFrame(() => setRun((n) => n + 1));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (!run) return null;
  return <div key={run} aria-hidden className="grain-dissolve" />;
}
