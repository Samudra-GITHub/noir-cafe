"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useLenis } from "lenis/react";
import { Button, Logo } from "@/components/ui";
import { SoundToggle } from "./SoundToggle";
import { DARK_HERO_ROUTES, NAV_LINKS, RESERVE_HREF, SITE } from "@/constants/site";
import { useNavTheme, type NavTheme } from "@/hooks/useNavTheme";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease, duration, sheet, sheetItem } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * GlassNav — 1296 × 72 pill, 28px from the top, z-50.
 * Over the hero: transparent warm frost (rgba(248,244,236,.08), 30px blur,
 * white/15 hairline). Once the hero is left behind it settles into warm cream
 * glass. The active page is marked by a caramel rule that slides between links;
 * hovering any other link grows a rule from its centre.
 * Collapses to a blurred menu sheet below 960px.
 */

const NAV_TOP = 28;
const NAV_HEIGHT = 72;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopLink({
  href,
  label,
  active,
  theme,
}: {
  href: string;
  label: string;
  active: boolean;
  theme: NavTheme;
}) {
  const safe = useMotionSafe();
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/link relative inline-flex h-11 items-center font-sans text-nav transition-colors duration-250 ease-noir",
        theme === "dark" ? "text-beige/85 hover:text-beige" : "text-strong/80 hover:text-strong",
        active && ["font-medium", theme === "dark" ? "text-beige" : "text-strong"],
      )}
    >
      <span
        className={cn(
          "transition-transform duration-500 ease-noir",
          active && "-translate-y-1",
        )}
      >
        {label}
      </span>

      {active ? (
        <motion.span
          layoutId="nav-active-rule"
          transition={safe ? ease(0.5) : { duration: 0 }}
          aria-hidden
          className="absolute top-[calc(50%+10px)] left-1/2 h-px w-[19px] -translate-x-1/2 bg-caramel"
        />
      ) : (
        <span
          aria-hidden
          className="absolute top-[calc(50%+10px)] left-1/2 h-px w-[19px] -translate-x-1/2 scale-x-0 bg-caramel/70 transition-transform duration-300 ease-noir group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100"
        />
      )}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const sectionTheme = useNavTheme(
    NAV_TOP + NAV_HEIGHT / 2,
    pathname,
    DARK_HERO_ROUTES.includes(pathname) ? "dark" : "light",
  );
  const [open, setOpen] = useState(false);
  const theme: NavTheme = open ? "dark" : sectionTheme;
  const reserveActive = isActive(pathname, RESERVE_HREF);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Close the sheet on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-[calc(var(--safe-top)+12px)] z-50 md:top-7"
      style={{ viewTransitionName: "site-nav" }}
    >
      <div className="container-page relative z-10">
        <nav
          aria-label="Primary"
          data-theme={theme}
          className={cn(
            "pointer-events-auto relative flex h-14 items-center justify-between rounded-full pr-2 pl-5 nav:h-18 nav:pr-6 nav:pl-6",
            "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-700 ease-noir",
            theme === "dark" ? "glass shadow-none" : "glass-cream",
            open && "border-transparent bg-transparent shadow-none backdrop-blur-none",
          )}
        >
          {/* Reading progress — a caramel hairline along the foot of the pill. */}
          <motion.span
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-8 bottom-0 left-8 h-px origin-left bg-caramel",
              open && "opacity-0",
            )}
            style={{ scaleX: progress }}
          />
          <Logo
            tone={theme === "dark" ? "inverse" : "strong"}
            className="transition-colors duration-700 ease-noir max-nav:[&>span:last-child]:text-[1.375rem]"
          />

          <ul className="hidden items-center gap-[30px] nav:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <DesktopLink {...link} active={isActive(pathname, link.href)} theme={theme} />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              href={RESERVE_HREF}
              variant={theme === "dark" ? "inverse" : "primary"}
              aria-current={reserveActive ? "page" : undefined}
              className={cn(
                "hidden sm:inline-flex",
                open && "sm:hidden",
                reserveActive && "bg-caramel text-beige hover:bg-caramel",
              )}
            >
              Reserve
            </Button>
            <SoundToggle inverse={theme === "dark"} className="nav:-mr-2 nav:order-first" />
            <MenuToggle ref={toggleRef} open={open} onToggle={() => setOpen((v) => !v)} theme={theme} />
          </div>
        </nav>
      </div>

      <MobileSheet open={open} onClose={close} pathname={pathname} toggleRef={toggleRef} />
    </header>
  );
}

function MenuToggle({
  ref,
  open,
  onToggle,
  theme,
}: {
  ref: React.Ref<HTMLButtonElement>;
  open: boolean;
  onToggle: () => void;
  theme: NavTheme;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className={cn(
        "grid size-11 place-items-center rounded-full transition-colors duration-500 ease-noir nav:hidden",
        theme === "dark" ? "text-beige" : "text-espresso",
      )}
    >
      <span className="relative block h-2.5 w-5">
        <span
          className={cn(
            "absolute left-0 h-px w-5 bg-current transition-transform duration-300 ease-noir",
            open ? "top-1/2 rotate-45" : "top-0",
          )}
        />
        <span
          className={cn(
            "absolute left-0 h-px w-5 bg-current transition-transform duration-300 ease-noir",
            open ? "top-1/2 -rotate-45" : "bottom-0",
          )}
        />
      </span>
    </button>
  );
}

function MobileSheet({
  open,
  onClose,
  pathname,
  toggleRef,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const lenis = useLenis();
  const safe = useMotionSafe();
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const first = sheetRef.current?.querySelector<HTMLElement>("a[href]");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep focus inside the sheet and its close toggle.
      const links = [...(sheetRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])];
      const cycle = [toggleRef.current, ...links].filter(Boolean) as HTMLElement[];
      const index = cycle.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      const next = e.shiftKey ? index - 1 : index + 1;
      cycle[(next + cycle.length) % cycle.length]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose, toggleRef]);

  const links = [...NAV_LINKS, { label: "Reserve", href: RESERVE_HREF }];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sheetRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          variants={safe ? sheet : undefined}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={safe ? undefined : { duration: 0 }}
          className="pointer-events-auto fixed inset-0 flex flex-col bg-espresso/85 text-beige nav:hidden"
          style={{ top: -NAV_TOP }}
        >
          <h2 id={titleId} className="sr-only">
            Site menu
          </h2>
          <nav aria-label="Mobile" className="container-page flex flex-1 flex-col justify-center pt-24">
            <ul className="flex flex-col gap-2">
              {links.map((link, i) => {
                const active = isActive(pathname, link.href);
                return (
                  <motion.li
                    key={link.href}
                    custom={i}
                    variants={safe ? sheetItem : undefined}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group/link flex items-baseline gap-4 py-1.5 font-display text-[2.75rem] leading-none transition-colors",
                        active ? "text-beige" : "text-beige/65 hover:text-beige",
                      )}
                      style={{ transitionDuration: `${duration.fast}s` }}
                    >
                      <span aria-hidden className="type-eyebrow w-6 text-caramel">{String(i + 1).padStart(2, "0")}</span>
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
          <div className="container-page flex flex-col gap-1 pb-10 font-mono text-eyebrow text-cream uppercase">
            <span>{SITE.address}</span>
            <span>{SITE.hours}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
