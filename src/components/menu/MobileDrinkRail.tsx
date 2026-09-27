"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui";
import type { Drink } from "@/data/types";
import { useFeedbackOnChange } from "@/lib/feedback";
import { cn } from "@/lib/cn";

const ROAST_LEVEL: Record<Drink["roast"], number> = { Light: 1, Medium: 2, Dark: 3 };

/**
 * Mobile drink rail — near-fullscreen cards that snap one at a time.
 * The card in view becomes "active": its photograph eases in, roast pips fill
 * in sequence and flavor notes float upward. Pressing a card zooms its image.
 */
export function MobileDrinkRail({ drinks }: { drinks: Drink[] }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  useFeedbackOnChange(active, "swipe");

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root: rail, threshold: 0.6 },
    );
    rail.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (i: number) => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-index="${i}"]`);
    if (rail && card) rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };

  return (
    <div className="md:hidden">
      <ul
        ref={railRef}
        aria-label="Featured drinks"
        className="swipe-rail -mx-[var(--gutter)] mt-10 gap-3 px-[var(--gutter)] pb-2"
      >
        {drinks.map((drink, i) => {
          const on = i === active;
          const level = ROAST_LEVEL[drink.roast];
          return (
            <li key={drink.slug} data-index={i} className="w-[84vw] max-w-[380px]">
              <article
                data-active={on || undefined}
                className="group/m relative isolate h-[min(70dvh,560px)] overflow-hidden rounded-xl bg-espresso text-beige shadow-card"
              >
                <Image
                  src={drink.image}
                  alt={drink.imageAlt}
                  fill
                  sizes="84vw"
                  className={cn(
                    "-z-10 object-cover transition-transform duration-[6s] ease-out group-active/m:scale-110 group-active/m:duration-500",
                    on ? "scale-[1.08]" : "scale-100",
                  )}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(23_18_14/0.15)_30%,rgb(23_18_14/0.9)_100%)]"
                />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  {/* Flavor notes float up when the card arrives. */}
                  <ul aria-label="Tasting notes" className="flex flex-wrap gap-2">
                    {drink.flavor.split(",").map((note, n) => (
                      <li
                        key={note}
                        className={cn(
                          "rounded-full border border-beige/25 bg-beige/10 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.06em] uppercase backdrop-blur-md",
                          on ? "motion-safe:animate-[float-up_0.7s_var(--ease-noir)_both]" : "opacity-0 motion-reduce:opacity-100",
                        )}
                        style={{ animationDelay: `${120 + n * 110}ms` }}
                      >
                        {note.trim()}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[2.25rem] leading-none">
                      <Link href={`/menu#${drink.slug}`} className="after:absolute after:inset-0 after:content-['']">
                        {drink.name}
                      </Link>
                    </h3>
                    <Price value={drink.price} size="md" tone="accent-inverse" />
                  </div>
                  <p className="mt-3 font-mono text-eyebrow text-cream uppercase">{drink.origin}</p>

                  <div className="mt-5 flex items-center justify-between border-t border-beige/15 pt-4">
                    <span className="flex items-center gap-2.5 font-mono text-micro text-cream uppercase">
                      Roast
                      <span role="img" aria-label={`${drink.roast} roast, ${level} of 3`} className="flex gap-1.5">
                        {[1, 2, 3].map((p) => (
                          <span
                            key={p}
                            aria-hidden
                            className={cn(
                              "size-[7px] rounded-full",
                              p <= level ? "bg-caramel" : "bg-beige/20",
                              p <= level && on && "motion-safe:animate-[pip-fill_0.5s_var(--ease-noir)_both]",
                            )}
                            style={p <= level ? { animationDelay: `${300 + p * 120}ms` } : undefined}
                          />
                        ))}
                      </span>
                    </span>
                    <span className="font-mono text-mono-sm text-beige">{drink.brewTime}</span>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Choose a drink">
        {drinks.map((d, i) => (
          <button
            key={d.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={d.name}
            onClick={() => goTo(i)}
            className="grid size-8 place-items-center"
          >
            <span
              className={cn(
                "h-1 rounded-full transition-all duration-500 ease-noir",
                i === active ? "w-6 bg-caramel" : "w-1.5 bg-sand",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
