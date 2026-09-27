"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MenuItemRow } from "./MenuItemRow";
import { MobileMenu } from "./MobileMenu";
import { MENU } from "@/data/menu";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useScrollTo } from "@/hooks/useScrollTo";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

const IDS = MENU.map((c) => c.id);
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Menu browser — sticky category index (with scrollspy) beside the six
 * category lists. Below 1024px the index is dropped and each category becomes
 * an accordion (Espresso opens first).
 */
export function MenuBrowser() {
  const { tr } = useI18n();
  const active = useScrollSpy(IDS);
  const scrollTo = useScrollTo();
  const safe = useMotionSafe();
  const [open, setOpen] = useState<Record<string, boolean>>({ [IDS[0]]: true });

  return (
    <>
    <div className="container-page">
      <MobileMenu />
    </div>
    <div className="container-page mt-16 hidden gap-10 md:grid lg:mt-[91px] lg:grid-cols-[292px_1fr] lg:gap-0">
      <nav aria-label={tr("Menu categories")} className="hidden lg:block">
        <ol className="sticky top-[140px] -mt-1 flex flex-col gap-[17px] leading-[14px]">
          {MENU.map((category, i) => {
            const isActive = active === category.id;
            return (
              <li key={category.id} className="flex">
                <a
                  href={`#${category.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(category.id);
                  }}
                  className={cn(
                    "group/index relative inline-flex items-center font-mono text-eyebrow uppercase transition-colors duration-300 ease-noir",
                    isActive ? "text-caramel-ink" : "text-stone hover:text-strong",
                  )}
                >
                  {isActive && (
                    <m.span
                      layoutId="menu-index-rule"
                      aria-hidden
                      transition={safe ? ease(0.5) : { duration: 0 }}
                      className="absolute top-1/2 -inset-s-5 h-px w-3 bg-caramel"
                    />
                  )}
                  <span className="transition-transform duration-300 ease-noir group-hover/index:translate-x-0.5">
                    {pad(i + 1)} · {tr(category.title)}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col gap-10 lg:gap-14">
        {MENU.map((category, i) => {
          const expanded = open[category.id] ?? false;
          const panelId = `${category.id}-items`;
          return (
            <section
              key={category.id}
              id={category.id}
              tabIndex={-1}
              aria-labelledby={`${category.id}-title`}
              className="scroll-mt-[140px] outline-none"
            >
              <div className="flex items-end justify-between gap-6">
                <h2 id={`${category.id}-title`} className="type-heading-lg text-strong">
                  {/* Small screens: the heading is the accordion toggle. */}
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen((s) => ({ ...s, [category.id]: !expanded }))}
                    className="flex items-center gap-3 text-start lg:hidden"
                  >
                    {tr(category.title)}
                    <ChevronDown
                      aria-hidden
                      strokeWidth={1.25}
                      className={cn(
                        "size-5 text-stone transition-transform duration-500 ease-noir",
                        expanded && "rotate-180",
                      )}
                    />
                  </button>
                  <span className="hidden lg:inline">{tr(category.title)}</span>
                </h2>
                <p className="mb-2 font-mono text-[0.5625rem] text-stone">
                  {pad(i + 1)} / {pad(MENU.length)}
                </p>
              </div>

              <ul
                id={panelId}
                className={cn(
                  "mt-[21px] divide-y divide-sand border-t border-sand",
                  expanded ? "block" : "hidden lg:block",
                )}
              >
                {category.items.map((item) => (
                  <MenuItemRow key={item.name} item={item} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
    </>
  );
}
