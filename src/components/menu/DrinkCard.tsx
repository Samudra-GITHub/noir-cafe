"use client";

import Image from "next/image";
import Link from "@/i18n/link";
import { m } from "framer-motion";
import { Price, RoastMeter } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import type { Drink } from "@/data/types";
import { hoverLift } from "@/lib/motion";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { cn } from "@/lib/cn";

/**
 * DrinkCard — "DrinkCard · drink · priority".
 * Ivory card, 1px sand border, 12px radius, soft walnut shadow.
 * Card behavior: group/card · image scale · focus-within ring · HOVER LIFT y −8.
 * The title is a stretched link so the whole card is one target.
 */
export function DrinkCard({
  drink,
  href,
  priority = false,
  className,
}: {
  drink: Drink;
  href: string;
  priority?: boolean;
  className?: string;
}) {
  const safe = useMotionSafe();
  const { tr } = useI18n();

  return (
    <m.article
      {...(safe ? hoverLift : {})}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-md border border-sand bg-surface shadow-card",
        "focus-within:ring-2 focus-within:ring-espresso focus-within:ring-offset-2 focus-within:ring-offset-cream",
        className,
      )}
    >
      <div data-cursor="view" className="relative aspect-[414/310] overflow-hidden bg-cream">
        <Image
          src={drink.image}
          alt={tr(drink.imageAlt)}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 414px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-noir group-hover/card:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6 pb-10 md:pb-[82px]">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-heading-sm leading-[1.2] text-strong">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {drink.name}
            </Link>
          </h3>
          <Price value={drink.price} size="md" tone="accent" />
        </div>

        <p className="mt-5 font-mono text-eyebrow text-stone uppercase">{tr(drink.origin)}</p>

        <hr className="mt-[18px] h-px border-0 bg-sand" />

        <dl className="flex justify-between gap-4 pt-4">
          {[
            { label: tr("Roast"), value: tr(drink.roast), extra: <RoastMeter roast={drink.roast} /> },
            { label: tr("Flavor"), value: tr(drink.flavor) },
            { label: tr("Brew"), value: drink.brewTime },
          ].map((spec, i) => (
            <div key={spec.label} className={cn("flex flex-col gap-0.5", i === 2 && "items-end text-end")}>
              <dt className="flex items-center gap-1.5 font-mono text-micro text-stone uppercase">
                {spec.label}
                {spec.extra}
              </dt>
              {/* Flavor notes rise back into place each time the card is hovered. */}
              <dd
                className="text-[0.6875rem] leading-[1.5] text-strong motion-safe:group-hover/card:animate-[rise-in_0.6s_var(--ease-noir)_both]"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </m.article>
  );
}

