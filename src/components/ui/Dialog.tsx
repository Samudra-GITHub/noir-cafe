"use client";

import { useEffect, useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { getLenis } from "@/lib/lenis";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

/** Focusable and actually rendered (skips content hidden at the current breakpoint). */
const focusables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Dialog — modal sheet over a blurred, warm-dimmed page. Traps focus, closes
 * on Escape or backdrop click, locks scroll (Lenis included) and returns focus
 * to the element that opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name; rendered visually hidden (content supplies its own heading). */
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { tr } = useI18n();
  const safe = useMotionSafe();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  // Callers pass inline handlers; keep the latest without re-running the
  // open/close effect (a re-run would move the focus-return target into the
  // dialog itself).
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => (panelRef.current && focusables(panelRef.current)[0])?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = focusables(panelRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.style.overflow = "";
      returnTo.current?.focus();
    };
  }, [open]);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 md:items-center md:p-8"
          initial={safe ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={safe ? { opacity: 0 } : undefined}
          transition={ease(0.35)}
        >
          <m.div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-espresso/55"
            initial={safe ? { backdropFilter: "blur(0px)" } : false}
            animate={{ backdropFilter: "blur(20px)" }}
            exit={safe ? { backdropFilter: "blur(0px)" } : undefined}
            transition={ease(0.45)}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className={cn(
              "relative max-h-[92svh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-surface shadow-card md:max-w-[1080px] md:rounded-2xl",
              className,
            )}
            initial={safe ? { opacity: 0, y: 40, scale: 0.98 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={safe ? { opacity: 0, y: 24, scale: 0.98 } : undefined}
            transition={ease(0.5)}
          >
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={tr("Close")}
              className="glass-cream absolute top-4 inset-e-4 z-10 grid size-11 place-items-center rounded-full text-espresso transition-transform duration-300 ease-noir hover:rotate-90"
            >
              <X aria-hidden className="size-4" strokeWidth={1.5} />
            </button>
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
