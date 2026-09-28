"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { Check, ChevronRight, Globe } from "lucide-react";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { switchLocale, useI18n, usePagePath } from "@/i18n/client";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { duration, ease } from "@/lib/motion";
import type { NavTheme } from "@/hooks/useNavTheme";
import { cn } from "@/lib/cn";

/**
 * Language switcher. Desktop (≥ 960px): a globe and the current code in the
 * glass nav open a glass dropdown. Phones and tablets: a row in the menu sheet
 * opens a bottom sheet. Either way the choice is remembered in a cookie for a
 * year (switchLocale) and the visitor stays on the same page.
 */

const code = (l: Locale) => l.toUpperCase();

function choose(next: Locale, current: Locale, path: string) {
  if (next !== current) switchLocale(next, path);
}

/* ── Desktop: glass dropdown ─────────────────────────────────────────────── */

const dropdown: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: ease(0.4) },
  exit: { opacity: 0, y: -6, scale: 0.98, filter: "blur(4px)", transition: ease(duration.fast) },
};
const dropdownItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: ease(0.4, 0.04 + i * 0.035) }),
};

export function LanguageMenu({ theme, className }: { theme: NavTheme; className?: string }) {
  const { locale, t } = useI18n();
  const path = usePagePath();
  const safe = useMotionSafe();
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const dark = theme === "dark";

  const openAt = (index: number) => {
    setFocusIndex(index);
    setOpen(true);
  };
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Move focus to the active item whenever it changes while open.
  useEffect(() => {
    if (open) itemRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  // A press anywhere else closes it (without stealing focus from where it went).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const current = LOCALES.indexOf(locale);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openAt(current);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openAt(LOCALES.length - 1);
    }
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    const last = LOCALES.length - 1;
    const move: Record<string, number> = {
      ArrowDown: focusIndex === last ? 0 : focusIndex + 1,
      ArrowUp: focusIndex === 0 ? last : focusIndex - 1,
      Home: 0,
      End: last,
    };
    if (e.key in move) {
      e.preventDefault();
      setFocusIndex(move[e.key]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1) {
      // Type-ahead on the language's own name or its code.
      const k = e.key.toLowerCase();
      const hit = LOCALES.findIndex((l, i) => i !== focusIndex && (l.startsWith(k) || LOCALE_META[l].name.toLowerCase().startsWith(k)));
      if (hit >= 0) setFocusIndex(hit);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t.locale.current.replace("{language}", LOCALE_META[locale].name)}
        onClick={() => (open ? close(false) : openAt(current))}
        onKeyDown={onTriggerKey}
        data-cursor="link"
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-full px-3 font-sans text-nav font-medium transition-colors duration-500 ease-noir",
          dark ? "text-beige/85 hover:bg-beige/10 hover:text-beige" : "text-strong/80 hover:bg-espresso/5 hover:text-strong",
          open && (dark ? "bg-beige/10 text-beige" : "bg-espresso/5 text-strong"),
        )}
      >
        <Globe aria-hidden className="size-4" strokeWidth={1.5} />
        <span aria-hidden className="tracking-[0.06em]">{code(locale)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            role="menu"
            aria-label={t.locale.choose}
            onKeyDown={onMenuKey}
            variants={safe ? dropdown : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={safe ? undefined : { duration: 0 }}
            className={cn(
              "absolute inset-e-0 top-[calc(100%+14px)] w-60 origin-top-right rounded-2xl p-2 rtl:origin-top-left",
              dark
                ? "border border-beige/15 bg-espresso/80 text-beige shadow-[0_24px_60px_rgb(23_18_14/0.45)] backdrop-blur-[30px] backdrop-saturate-[1.15]"
                : "border border-[var(--glass-cream-border)] bg-ivory/95 text-strong shadow-[0_24px_60px_rgb(60_36_21/0.16)] backdrop-blur-[30px] backdrop-saturate-[1.1]",
            )}
          >
            <p aria-hidden className={cn("px-3 pt-2 pb-1 font-mono text-eyebrow uppercase", dark ? "text-cream/70" : "text-stone")}>
              {t.locale.language}
            </p>
            {LOCALES.map((l, i) => {
              const selected = l === locale;
              return (
                <m.button
                  key={l}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  tabIndex={i === focusIndex ? 0 : -1}
                  custom={i}
                  variants={safe ? dropdownItem : undefined}
                  onClick={() => (selected ? close() : choose(l, locale, path))}
                  onMouseEnter={() => setFocusIndex(i)}
                  data-cursor="link"
                  className={cn(
                    "group/lang flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start outline-none transition-colors duration-250 ease-noir",
                    dark ? "hover:bg-beige/8 focus-visible:bg-beige/10" : "hover:bg-espresso/5 focus-visible:bg-espresso/6",
                    "focus-visible:ring-1 focus-visible:ring-caramel/70",
                  )}
                >
                  <span lang={l} className="flex-1 font-display text-[1.375rem] leading-tight">
                    {LOCALE_META[l].name}
                  </span>
                  <span aria-hidden className={cn("font-mono text-eyebrow", dark ? "text-cream/60" : "text-stone")}>
                    {code(l)}
                  </span>
                  <Check
                    aria-hidden
                    strokeWidth={1.6}
                    className={cn("size-4 text-caramel transition-opacity duration-300", selected ? "opacity-100" : "opacity-0")}
                  />
                </m.button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Phones & tablets: a row in the menu sheet that opens a bottom sheet ─── */

const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: ease(0.4) },
  exit: { opacity: 0, transition: ease(duration.fast) },
};
const bottomSheet: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: ease(0.55) },
  exit: { y: "100%", transition: ease(0.35) },
};

export function LanguageSheet({ className }: { className?: string }) {
  const { locale, t, tr } = useI18n();
  const path = usePagePath();
  const safe = useMotionSafe();
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [focusIndex, setFocusIndex] = useState(() => LOCALES.indexOf(locale));

  const close = () => {
    setOpen(false);
    rowRef.current?.focus();
  };

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>(`[data-choice="${LOCALES[focusIndex]}"]`)?.focus();
  }, [open, focusIndex]);

  // Keyboard stays inside the sheet; Escape closes only the sheet, not the menu under it.
  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      const focusables = [...(panelRef.current?.querySelectorAll<HTMLElement>("button") ?? [])].filter((el) => el.tabIndex >= 0);
      const i = focusables.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length]?.focus();
    }
  };

  const onGroupKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    const to = e.key === "Home" ? 0 : e.key === "End" ? LOCALES.length - 1 : step ? (focusIndex + step + LOCALES.length) % LOCALES.length : -1;
    if (to < 0) return;
    e.preventDefault();
    setFocusIndex(to);
  };

  return (
    <div className={className}>
      <button
        ref={rowRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setFocusIndex(LOCALES.indexOf(locale));
          setOpen(true);
        }}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-beige/15 bg-beige/[0.06] px-4 text-start text-beige transition-colors duration-300 hover:bg-beige/10"
      >
        <Globe aria-hidden className="size-4 text-caramel-glow" strokeWidth={1.5} />
        <span className="font-mono text-eyebrow text-cream uppercase">{t.locale.language}</span>
        <span lang={locale} className="ms-auto font-display text-[1.375rem] leading-none">
          {LOCALE_META[locale].name}
        </span>
        <ChevronRight aria-hidden className="size-4 text-cream rtl:rotate-180" strokeWidth={1.5} />
      </button>

      {/* Portalled: the menu sheet animates backdrop-filter, which would otherwise
          become this fixed layer's containing block and scroll it with the sheet. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <m.div
                key="language-sheet"
                className="fixed inset-0 z-[60]"
                variants={safe ? backdrop : undefined}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={safe ? undefined : { duration: 0 }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={close}
                  className="absolute inset-0 size-full cursor-default bg-espresso/45"
                />
                <m.div
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  onKeyDown={onKeyDown}
                  variants={safe ? bottomSheet : undefined}
                  drag={safe ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.6 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 90 || info.velocity.y > 600) close();
                  }}
                  className="absolute inset-x-0 bottom-0 rounded-t-[28px] border-t border-beige/15 bg-espresso/90 px-5 pt-3 pb-[calc(24px+var(--safe-bottom))] text-beige shadow-[0_-24px_60px_rgb(23_18_14/0.4)] backdrop-blur-[30px] backdrop-saturate-[1.15]"
                >
                  <span aria-hidden className="mx-auto mb-5 block h-1 w-10 rounded-full bg-beige/25" />
                  <div className="flex items-center justify-between">
                    <h3 id={titleId} className="font-display text-[2rem] leading-none">
                      {t.locale.choose}
                    </h3>
                    <button
                      type="button"
                      onClick={close}
                      className="-me-2 grid size-11 place-items-center rounded-full font-mono text-eyebrow text-cream uppercase hover:text-beige"
                    >
                      {tr("Close")}
                    </button>
                  </div>
                  <p className="mt-2 font-sans text-body-xs text-cream">{tr("The page reloads in the language you choose.")}</p>

                  <div role="radiogroup" aria-labelledby={titleId} onKeyDown={onGroupKey} className="mt-5 flex flex-col">
                    {LOCALES.map((l, i) => {
                      const selected = l === locale;
                      return (
                        <button
                          key={l}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          tabIndex={i === focusIndex ? 0 : -1}
                          data-choice={l}
                          onClick={() => (selected ? close() : choose(l, locale, path))}
                          className={cn(
                            "flex min-h-14 items-center gap-4 border-t border-beige/10 px-1 text-start transition-colors duration-300 first:border-t-0",
                            selected ? "text-beige" : "text-beige/70 hover:text-beige",
                          )}
                        >
                          <span lang={l} className="flex-1 font-display text-[1.75rem] leading-none">
                            {LOCALE_META[l].name}
                          </span>
                          <span aria-hidden className="font-mono text-eyebrow text-cream">{code(l)}</span>
                          <span
                            aria-hidden
                            className={cn(
                              "grid size-6 place-items-center rounded-full border transition-colors duration-300",
                              selected ? "border-caramel bg-caramel text-beige" : "border-beige/25",
                            )}
                          >
                            {selected && <Check className="size-3.5" strokeWidth={2} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
