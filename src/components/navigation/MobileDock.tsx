"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { CalendarCheck, Coffee, House, MapPin, ShoppingBag, type LucideIcon } from "lucide-react";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/menu", label: "Menu", icon: Coffee },
  { href: "/locations", label: "Visit", icon: MapPin },
  { href: "/reservation", label: "Reserve", icon: CalendarCheck },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Mobile dock (below 768px) — a floating warm-glass bar above the home
 * indicator. Slides away while scrolling down and returns on the way up, at
 * the page top, and whenever focus enters it. Safe-area aware.
 */
export function MobileDock() {
  const pathname = usePathname();
  const safe = useMotionSafe();
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - last.current;
        if (y < 120) setHidden(false);
        else if (delta > 8) setHidden(true);
        else if (delta < -8) setHidden(false);
        last.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Reveal on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setHidden(false);
  }

  return (
    <nav
      aria-label="Mobile"
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "fixed inset-x-4 z-50 md:hidden",
        "transition-transform duration-500 ease-noir motion-reduce:transition-none",
        hidden && "translate-y-[calc(100%+40px)]",
      )}
      style={{ bottom: "calc(14px + var(--safe-bottom))", viewTransitionName: "mobile-dock" }}
    >
      <ul className="mx-auto flex h-[var(--dock-height)] max-w-[420px] items-stretch justify-between rounded-full border border-white/15 bg-espresso/80 px-2 text-beige shadow-[0_18px_40px_-12px_rgb(23_18_14/0.6)] backdrop-blur-[30px] backdrop-saturate-[1.2]">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full"
              >
                {active && (
                  <m.span
                    layoutId="dock-active"
                    aria-hidden
                    transition={safe ? ease(0.45) : { duration: 0 }}
                    className="absolute inset-x-1 inset-y-1.5 rounded-full bg-beige/12"
                  />
                )}
                <Icon
                  aria-hidden
                  strokeWidth={1.4}
                  className={cn("relative size-[22px] transition-colors duration-300", active ? "text-caramel-glow" : "text-beige/85")}
                />
                <span
                  className={cn(
                    "relative font-mono text-[0.6875rem] tracking-[0.06em] uppercase transition-colors duration-300",
                    active ? "text-beige" : "text-beige/70",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
