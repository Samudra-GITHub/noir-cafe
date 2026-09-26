"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";

type CursorState = "default" | "link" | "view" | "progress" | "text" | "hidden";

const INTERACTIVE = 'a[href], button:not([disabled]), [role="button"], [role="radio"], summary, label[for]';
const TEXT_ENTRY = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]';
const RING = 2 * Math.PI * 21;

/**
 * Custom cursor — a small coffee bean that follows the pointer on a soft
 * spring, with states read from the element beneath it:
 *   link      → a caramel ring opens around the bean
 *   view      → the ring carries a "View" label ([data-cursor="view"])
 *   progress  → the ring fills with the section's scroll progress
 *               ([data-cursor="progress"], e.g. the hero and preparation story;
 *               add data-cursor-scope="pinned" for a sticky section)
 *   text      → hidden over inputs, so the native caret shows
 * Only mounts for fine pointers with motion allowed; the native cursor returns
 * whenever the custom one is not active.
 */
export function CustomCursor() {
  const [active, setActive] = useState(false);
  const [state, setState] = useState<CursorState>("hidden");
  const [progress, setProgress] = useState(0);
  const progressEl = useRef<HTMLElement | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 700, damping: 45, mass: 0.4 });
  const rx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setActive(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const readProgress = () => {
      const el = progressEl.current;
      if (!el) return;
      let p: number;
      if (el.dataset.cursorScope === "pinned") {
        // Pinned hero: progress is how far the page has travelled over it.
        p = window.scrollY / Math.max(1, el.offsetHeight);
      } else {
        const r = el.getBoundingClientRect();
        p = -r.top / Math.max(1, r.height - window.innerHeight);
      }
      setProgress(Math.min(1, Math.max(0, p)));
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      if (!target) return;
      let next: CursorState = "default";
      const tagged = target.closest<HTMLElement>("[data-cursor]");
      if (target.closest(TEXT_ENTRY)) next = "text";
      else if (tagged?.dataset.cursor === "view") next = "view";
      else if (target.closest(INTERACTIVE) || tagged?.dataset.cursor === "link") next = "link";
      else if (tagged?.dataset.cursor === "progress") {
        next = "progress";
        progressEl.current = tagged;
        readProgress();
      }
      setState((s) => (s === next ? s : next));
    };
    const leave = () => setState("hidden");
    const down = () => root.classList.add("cursor-pressed");
    const up = () => root.classList.remove("cursor-pressed");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", readProgress, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      root.classList.remove("has-custom-cursor", "cursor-pressed");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", readProgress);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [active, x, y]);

  if (!active) return null;

  const ringOpen = state === "link" || state === "view" || state === "progress";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150] mix-blend-normal">
      {/* Ring */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: rx, y: ry }}
      >
        <div
          className={cn(
            "grid -translate-x-1/2 -translate-y-1/2 place-items-center transition-[opacity,scale] duration-300 ease-noir",
            ringOpen ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
            <circle cx="24" cy="24" r="21" fill="rgb(248 244 236 / 0.08)" stroke="var(--noir-caramel)" strokeOpacity={state === "progress" ? 0.25 : 0.9} strokeWidth="1" />
            {state === "progress" && (
              <circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="var(--noir-caramel)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - progress)}
              />
            )}
          </svg>
          {state === "view" && (
            <span className="absolute font-mono text-[0.5rem] tracking-wide text-caramel-glow uppercase">View</span>
          )}
        </div>
      </motion.div>

      {/* Bean */}
      <motion.div className="absolute top-0 left-0" style={{ x: sx, y: sy }}>
        <svg
          viewBox="0 0 20 26"
          className={cn(
            "cursor-bean h-[15px] w-[12px] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] transition-[opacity,scale] duration-200 ease-noir",
            state === "hidden" || state === "text" ? "scale-0 opacity-0" : "opacity-100",
            state === "link" || state === "view" ? "scale-[0.7]" : "scale-100",
          )}
        >
          <ellipse cx="10" cy="13" rx="9" ry="12" fill="var(--noir-caramel)" stroke="var(--noir-beige)" strokeWidth="0.8" />
          <path d="M10 2c-3 3.5-3 7.5 0 11s3 7.5 0 11" fill="none" stroke="var(--noir-walnut)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}
