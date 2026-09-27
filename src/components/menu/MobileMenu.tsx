"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Badge, Button, Dialog, NoteChip, Price, RoastMeter } from "@/components/ui";
import { MENU, MENU_EXTRAS, TODAY_AT_THE_BAR } from "@/data/menu";
import type { MenuItem } from "@/data/types";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useScrollTo } from "@/hooks/useScrollTo";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const IDS = MENU.map((c) => `m-${c.id}`);
const CHIP_BAR_OFFSET = 150;

/** Photography used behind each category's fullscreen drink sheet. */
const CATEGORY_IMAGE: Record<string, string> = {
  espresso: "/images/home/drink-noir-cortado.jpg",
  latte: "/images/home/drink-caramel-cloud.jpg",
  cappuccino: "/images/home/loved-02.jpg",
  matcha: TODAY_AT_THE_BAR.image,
  tea: "/images/home/loved-04.jpg",
  bakery: TODAY_AT_THE_BAR.image,
};

/**
 * Mobile menu (below 768px) — a sticky rail of category chips that tracks the
 * section on screen, drink cards that expand in place to reveal notes and
 * roast, and a fullscreen detail sheet for each drink.
 */
export function MobileMenu() {
  const active = useScrollSpy(IDS, 0.3);
  const scrollTo = useScrollTo();
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ item: MenuItem; category: string } | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  // Keep the active chip centred in the rail — scrolling the rail only, never
  // the page (scrollIntoView would also pull the window to the chip bar).
  useEffect(() => {
    const rail = chipsRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!rail || !chip) return;
    const left = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <div className="md:hidden">
      <div
        className="sticky z-30 -mx-[var(--gutter)] mt-12 border-b border-sand bg-canvas/85 py-3 backdrop-blur-xl"
        style={{ top: "calc(var(--safe-top) + 76px)" }}
      >
        <div ref={chipsRef} role="tablist" aria-label="Menu categories" className="swipe-rail gap-2 px-[var(--gutter)] [&>*]:snap-start">
          {MENU.map((category) => {
            const id = `m-${category.id}`;
            const on = active === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                data-chip={id}
                onClick={() => scrollTo(id, CHIP_BAR_OFFSET)}
                className={cn(
                  "h-10 rounded-full border px-4 font-mono text-[0.625rem] tracking-[0.08em] uppercase transition-colors duration-300",
                  on ? "border-espresso bg-espresso text-beige" : "border-sand text-strong",
                )}
              >
                {category.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-12 pt-8">
        {MENU.map((category) => (
          <section key={category.id} id={`m-${category.id}`} tabIndex={-1} aria-labelledby={`m-${category.id}-title`} className="outline-none">
            <h2 id={`m-${category.id}-title`} className="font-display text-[2.25rem] leading-none text-strong">
              {category.title}
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {category.items.map((item) => {
                const key = `${category.id}-${item.name}`;
                const expanded = open === key;
                return (
                  <li key={key}>
                    <DrinkRow
                      item={item}
                      expanded={expanded}
                      onToggle={() => setOpen(expanded ? null : key)}
                      onDetails={() => setDetail({ item, category: category.id })}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <Dialog
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.item.name} details` : "Drink details"}
        className="h-dvh max-h-none rounded-none"
      >
        {detail && <DrinkSheet item={detail.item} image={CATEGORY_IMAGE[detail.category]} />}
      </Dialog>
    </div>
  );
}

function DrinkRow({
  item,
  expanded,
  onToggle,
  onDetails,
}: {
  item: MenuItem;
  expanded: boolean;
  onToggle: () => void;
  onDetails: () => void;
}) {
  const safe = useMotionSafe();
  const panelId = `drink-${item.name.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <article
      className={cn(
        "rounded-md border bg-surface transition-[border-color,box-shadow] duration-500 ease-noir",
        expanded ? "border-caramel/60 shadow-card" : "border-sand",
      )}
    >
      <h3>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-[76px] w-full items-center gap-4 px-5 py-4 text-left active:bg-cream/60"
        >
          <span className="flex-1">
            <span className="flex items-center gap-2">
              <span className="font-sans text-body-sm font-semibold text-strong">{item.name}</span>
              {item.house && <Badge>House</Badge>}
            </span>
            <span className="mt-1 block font-sans text-body-xs text-stone">{item.description}</span>
          </span>
          <Price value={item.price} size="sm" />
          <ChevronDown
            aria-hidden
            strokeWidth={1.4}
            className={cn("size-4 text-stone transition-transform duration-500 ease-noir", expanded && "rotate-180")}
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            id={panelId}
            initial={safe ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={safe ? { height: 0, opacity: 0 } : undefined}
            transition={ease(0.45)}
            className="overflow-hidden"
          >
            <div className="border-t border-sand px-5 pt-4 pb-5">
              <ul aria-label="Tasting notes" className="flex flex-wrap gap-2">
                {item.notes.map((n, i) => (
                  <li key={n} className="motion-safe:animate-[float-up_0.5s_var(--ease-noir)_both]" style={{ animationDelay: `${i * 70}ms` }}>
                    <NoteChip>{n}</NoteChip>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between">
                {item.roast ? <RoastMeter roast={item.roast} size="md" label /> : <span />}
                <button
                  type="button"
                  onClick={onDetails}
                  aria-haspopup="dialog"
                  className="inline-flex min-h-11 items-center font-mono text-eyebrow text-caramel-ink uppercase underline decoration-caramel/40 underline-offset-4"
                >
                  Details
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function DrinkSheet({ item, image }: { item: MenuItem; image: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-espresso text-beige">
      <div className="relative h-[48dvh] shrink-0 overflow-hidden">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.1),rgb(23_18_14/0.95))]" />
      </div>
      <div className="relative z-10 -mt-24 flex flex-1 flex-col px-[var(--gutter)] pb-[calc(32px+var(--safe-bottom))]">
        {item.house && <Badge className="self-start">House</Badge>}
        <p className="mt-4 font-display text-[3rem] leading-[0.95]">{item.name}</p>
        <p className="mt-3 font-sans text-body-sm text-cream">{item.description}</p>
        <ul aria-label="Tasting notes" className="mt-6 flex flex-wrap gap-2">
          {item.notes.map((n, i) => (
            <li key={n} className="motion-safe:animate-[float-up_0.6s_var(--ease-noir)_both]" style={{ animationDelay: `${200 + i * 90}ms` }}>
              <NoteChip inverse>{n}</NoteChip>
            </li>
          ))}
        </ul>
        <dl className="mt-8 border-t border-char">
          {item.roast && (
            <div className="flex items-center justify-between border-b border-char py-4">
              <dt className="font-mono text-micro text-taupe uppercase">Roast</dt>
              <dd>
                <RoastMeter roast={item.roast} size="md" label className="[&_span:last-child]:text-cream" />
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between border-b border-char py-4">
            <dt className="font-mono text-micro text-taupe uppercase">Price</dt>
            <dd>
              <Price value={item.price} size="md" tone="inverse" />
            </dd>
          </div>
          <div className="py-4">
            <dt className="font-mono text-micro text-taupe uppercase">Make it yours</dt>
            <dd className="mt-2 font-mono text-eyebrow text-cream uppercase">{MENU_EXTRAS}</dd>
          </div>
        </dl>
        <Button href="/reservation" variant="inverse" fullWidth className="mt-auto justify-between pr-6">
          Reserve a table
        </Button>
      </div>
    </div>
  );
}
