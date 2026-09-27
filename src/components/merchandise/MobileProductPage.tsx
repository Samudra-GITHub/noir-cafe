"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Button, Chip, QuantitySelector, RoastMeter, ZoomableImage, type RoastLevel } from "@/components/ui";
import { HOME_RITUAL_SET, type ShopProduct } from "@/data/shop";
import { useBag } from "@/hooks/useBag";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { successReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { feedback, useFeedbackOnChange } from "@/lib/feedback";
import { OriginMap } from "./OriginMap";

/**
 * Mobile product page — Apple Store–style, shown full screen below 768px:
 * a swipeable, pinch-to-zoom gallery, then name and price, roast and variant
 * choices, specifications, an origin map, and a sticky buy bar that clears
 * the home indicator.
 */
export function MobileProductPage({ product }: { product: ShopProduct }) {
  const safe = useMotionSafe();
  const { add, count } = useBag();
  const galleryRef = useRef<HTMLUListElement>(null);
  const [frame, setFrame] = useState(0);
  useFeedbackOnChange(frame, "swipe");
  const [roast, setRoast] = useState<RoastLevel | undefined>(product.roasts?.[Math.min(1, product.roasts.length - 1)]);
  const [variants, setVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((g) => [g.name, g.options[0]])),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Three frames: the object, a detail crop, and it in use.
  const lifestyle = product.slug === HOME_RITUAL_SET.slug ? "/images/home/shop-ritual.jpg" : HOME_RITUAL_SET.image;
  const frames = [
    { src: product.image, alt: product.imageAlt, className: "" },
    { src: product.image, alt: `${product.name}, detail`, className: "scale-[1.7] object-[42%_46%]" },
    { src: lifestyle, alt: "The object in a morning coffee ritual", className: "" },
  ];

  useEffect(() => {
    const rail = galleryRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setFrame(Number((e.target as HTMLElement).dataset.index));
      },
      { root: rail, threshold: 0.6 },
    );
    rail.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const variantLabel = [roast && `${roast} roast`, ...Object.values(variants)].filter(Boolean).join(" · ");
  const specs = [
    { label: "Format", value: product.spec },
    ...product.details.map((d, i) => ({ label: ["Detail", "Care", "Notes"][i] ?? "Detail", value: d })),
    ...(roast ? [{ label: "Roast", value: roast }] : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {/* Gallery */}
      <div className="relative bg-cream">
        <ul ref={galleryRef} aria-label={`${product.name} gallery`} className="swipe-rail">
          {frames.map((f, i) => (
            <li key={i} data-index={i} className="w-screen" aria-label={`Image ${i + 1} of ${frames.length}`}>
              <ZoomableImage
                src={f.src}
                alt={f.alt}
                sizes="100vw"
                priority={i === 0}
                className="aspect-[4/5] w-full"
                imageClassName={f.className}
              />
            </li>
          ))}
        </ul>
        <div aria-hidden className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
          {frames.map((_, i) => (
            <span key={i} className={cn("h-1 rounded-full transition-all duration-500", i === frame ? "w-5 bg-espresso" : "w-1.5 bg-espresso/30")} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-[var(--gutter)] pt-7 pb-8">
        <p className="font-mono text-eyebrow text-caramel-ink uppercase">{product.spec}</p>
        <h3 className="mt-2 font-display text-[2.75rem] leading-[1] text-strong">{product.name}</h3>
        <p className="mt-4 font-sans text-body-sm leading-[26px] text-stone">{product.description}</p>

        {product.roasts && (
          <fieldset className="mt-8">
            <legend className="font-mono text-micro text-stone uppercase">Roast</legend>
            <div className="swipe-rail mt-3 gap-2 [&>*]:snap-start">
              {product.roasts.map((r) => (
                <Chip key={r} size="lg" selected={roast === r} onClick={() => setRoast(r)} icon={<RoastMeter roast={r} />} className="h-11">
                  {r}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}

        {product.variants.map((group) => (
          <fieldset key={group.name} className="mt-6">
            <legend className="font-mono text-micro text-stone uppercase">{group.name}</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {group.options.map((option) => (
                <Chip
                  key={option}
                  size="lg"
                  selected={variants[group.name] === option}
                  onClick={() => setVariants((v) => ({ ...v, [group.name]: option }))}
                  className="h-11 w-full"
                >
                  {option}
                </Chip>
              ))}
            </div>
          </fieldset>
        ))}

        <section aria-labelledby={`${product.slug}-specs`} className="mt-10">
          <h4 id={`${product.slug}-specs`} className="font-display text-[1.75rem] text-strong">
            Specifications
          </h4>
          <dl className="mt-3 border-t border-sand">
            {specs.map((s) => (
              <div key={s.label + s.value} className="flex items-baseline justify-between gap-6 border-b border-sand py-3.5">
                <dt className="font-mono text-micro text-stone uppercase">{s.label}</dt>
                <dd className="text-right font-sans text-body-xs text-strong">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby={`${product.slug}-origin`} className="mt-10">
          <h4 id={`${product.slug}-origin`} className="font-display text-[1.75rem] text-strong">
            {product.origin.title}
          </h4>
          <div className="mt-4">
            <OriginMap title={product.origin.title} points={product.origin.points} />
          </div>
        </section>
      </div>

      {/* Sticky buy bar */}
      <div
        className="sticky bottom-0 z-10 border-t border-sand bg-canvas/90 px-[var(--gutter)] pt-4 backdrop-blur-xl"
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <div aria-live="polite" className="min-h-5">
          <AnimatePresence>
            {added && (
              <m.p variants={safe ? successReveal : undefined} initial="hidden" animate="visible" className="mb-3 font-mono text-micro text-caramel-ink uppercase">
                Added · {count} {count === 1 ? "item" : "items"} set aside
              </m.p>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <Button
            fullWidth
            className="justify-between pr-6"
            onClick={() => {
              add({ slug: product.slug, name: product.name, variant: variantLabel, quantity, price: product.price });
              setAdded(true);
              feedback("add");
            }}
          >
            Add · ${(product.price * quantity).toFixed(0)}
          </Button>
        </div>
      </div>
    </div>
  );
}
