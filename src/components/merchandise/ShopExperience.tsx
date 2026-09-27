"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button, Chip, Dialog, Eyebrow, NoteChip, QuantitySelector, RoastMeter, type RoastLevel } from "@/components/ui";
import { HOME_RITUAL_SET, PRODUCTS, SHOP_FILTERS, type ShopProduct } from "@/data/shop";
import { useBag } from "@/hooks/useBag";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease, productHover, successReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { feedback } from "@/lib/feedback";
import { BrewGuide } from "./BrewGuide";
import { ProductReviews } from "./ProductReviews";
import { MobileProductPage } from "./MobileProductPage";
import { useFormat, useI18n } from "@/i18n/client";

type FilterId = (typeof SHOP_FILTERS)[number]["id"];

/**
 * Shop — the featured home-ritual set, category filters and the product grid.
 * Every product opens a quick view with roast chips, variant and quantity
 * selectors, and a sticky information column. Checkout is not built yet.
 */
export function ShopExperience() {
  const { tr } = useI18n();
  const [filter, setFilter] = useState<FilterId>("all");
  const [quickView, setQuickView] = useState<ShopProduct | null>(null);
  const safe = useMotionSafe();
  const visible = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <>
      <FeaturedSet onView={() => setQuickView(HOME_RITUAL_SET)} />

      <section aria-labelledby="products-title" className="container-page mt-16 lg:mt-14">
        <h2 id="products-title" className="sr-only">{tr("Products")}</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LayoutGroup id="shop-filters">
            <div role="toolbar" aria-label={tr("Filter products")} className="-ms-2 flex flex-wrap">
              {SHOP_FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "relative inline-flex h-11 items-center px-2 font-mono text-eyebrow uppercase transition-colors duration-300 ease-noir",
                      active ? "text-caramel-ink" : "text-stone hover:text-strong",
                    )}
                  >
                    {tr(f.label)}
                    {active && (
                      <m.span
                        layoutId="shop-filter-rule"
                        aria-hidden
                        transition={safe ? ease(0.45) : { duration: 0 }}
                        className="absolute inset-e-2 bottom-2 inset-s-2 h-px bg-caramel"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          <p aria-live="polite" className="font-mono text-eyebrow text-stone uppercase">
            {String(visible.length).padStart(2, "0")}{" "}{tr("products")}</p>
        </div>

        <m.ul layout={safe} className="mt-3 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-[81px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product) => (
              <m.li
                key={product.slug}
                layout={safe}
                initial={safe ? { opacity: 0, y: 16 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={safe ? { opacity: 0, y: 8 } : undefined}
                transition={ease(0.5)}
              >
                <ProductCard product={product} onQuickView={() => setQuickView(product)} />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      </section>

      <Dialog
        open={quickView !== null}
        onClose={() => setQuickView(null)}
        title={quickView ? tr("{name} — quick view", { name: tr(quickView.name) }) : tr("Quick view")}
        className="max-md:h-dvh max-md:max-h-none max-md:rounded-none"
      >
        {quickView && (
          <>
            {/* Phones: an Apple Store–style product page; larger screens: the quick view. */}
            <div className="md:hidden">
              <MobileProductPage key={quickView.slug} product={quickView} />
            </div>
            <div className="hidden md:block">
              <QuickView key={quickView.slug} product={quickView} />
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}

function FeaturedSet({ onView }: { onView: () => void }) {
  const { tr } = useI18n();
  const format = useFormat();
  const set = HOME_RITUAL_SET;
  return (
    <FadeUp className="container-page mt-12 grid gap-6 lg:mt-[62px] lg:grid-cols-[1fr_422px]">
      <div className="group/media relative aspect-[850/480] overflow-hidden rounded-xl bg-cream max-lg:aspect-[4/3]">
        <Image
          src={set.image}
          alt={tr(set.imageAlt)}
          fill
          priority
          sizes="(min-width: 1280px) 850px, (min-width: 1024px) 60vw, 100vw"
          className="object-cover object-[50%_60%] transition-transform duration-[1.2s] ease-noir group-hover/media:scale-[1.03]"
        />
      </div>
      <section aria-labelledby="set-title" className="flex flex-col rounded-xl bg-cream p-8 md:p-[42px]">
        <Eyebrow>{tr(set.spec)}</Eyebrow>
        <h2 id="set-title" className="mt-[15px] font-display text-[2.25rem] leading-[1.1] text-strong md:text-heading-lg">
          {tr(set.name)}
        </h2>
        <p className="mt-3 font-sans text-body-xs text-stone">{tr(set.description)}</p>
        <p className="mt-16 font-mono text-[1.25rem] text-strong lg:mt-auto">{format.price(set.price)}</p>
        <Button onClick={onView} className="mt-5 self-start" aria-haspopup="dialog">{tr("View the set")}</Button>
      </section>
    </FadeUp>
  );
}

function ProductCard({ product, onQuickView }: { product: ShopProduct; onQuickView: () => void }) {
  const { tr } = useI18n();
  const format = useFormat();
  const safe = useMotionSafe();
  return (
    <m.article
      className="group/card relative"
      whileHover={safe ? productHover.card : undefined}
      transition={productHover.transition}
    >
      <div data-cursor="view" className="relative aspect-[416/340] overflow-hidden rounded-md bg-cream">
        <Image
          src={product.image}
          alt={tr(product.imageAlt)}
          fill
          sizes="(min-width: 1280px) 416px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-noir group-hover/card:scale-[1.06]"
        />
        <span
          aria-hidden
          className="glass-cream absolute bottom-4 left-1/2 inline-flex h-9 -translate-x-1/2 translate-y-2 items-center rounded-full px-4 font-mono text-eyebrow text-strong uppercase opacity-0 transition-[opacity,translate] duration-500 ease-noir group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100"
        >{tr("Quick view")}</span>
      </div>
      <div className="mt-[11px] flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.625rem] leading-[1.15] text-strong">
            <button
              type="button"
              onClick={onQuickView}
              aria-haspopup="dialog"
              className="text-start outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline focus-visible:decoration-caramel focus-visible:underline-offset-4"
            >
              {tr(product.name)}
            </button>
          </h3>
          <p className="mt-2 font-mono text-micro text-stone">{tr(product.spec)}</p>
        </div>
        <p className="pt-0.5 font-sans text-body-xs text-strong">{format.price(product.price, true)}</p>
      </div>
    </m.article>
  );
}

function QuickView({ product }: { product: ShopProduct }) {
  const { tr } = useI18n();
  const format = useFormat();
  const safe = useMotionSafe();
  const { add, count } = useBag();
  const [roast, setRoast] = useState<RoastLevel | undefined>(product.roasts?.[Math.min(1, product.roasts.length - 1)]);
  const [variants, setVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((g) => [g.name, g.options[0]])),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variantLabel = [roast && `${roast} roast`, ...Object.values(variants)].filter(Boolean).join(" · ");

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-[4/5] bg-cream md:aspect-auto md:min-h-[640px]">
        <Image src={product.image} alt={tr(product.imageAlt)} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
      </div>

      {/* Product information stays in view while the image column scrolls on tall content. */}
      <div className="p-6 md:p-10">
        <div className="md:sticky md:top-10">
          <Eyebrow>{tr(product.spec)}</Eyebrow>
          <h3 className="mt-3 font-display text-heading-xl leading-[1.05] text-strong">{tr(product.name)}</h3>
          <p className="mt-4 font-mono text-[1.25rem] text-strong">{format.price(product.price * quantity)}</p>
          <p className="mt-5 font-sans text-body-sm leading-[26px] text-stone">{tr(product.description)}</p>

          {product.roasts && (
            <fieldset className="mt-8">
              <legend className="font-mono text-micro text-stone uppercase">{tr("Roast")}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.roasts.map((r) => (
                  <Chip key={r} selected={roast === r} onClick={() => setRoast(r)} icon={<RoastMeter roast={r} />}>
                    {r}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}

          {product.variants.map((group) => (
            <fieldset key={group.name} className="mt-6">
              <legend className="font-mono text-micro text-stone uppercase">{tr(group.name)}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <Chip
                    key={option}
                    selected={variants[group.name] === option}
                    onClick={() => setVariants((v) => ({ ...v, [group.name]: option }))}
                  >
                    {tr(option)}
                  </Chip>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button
              onClick={() => {
                add({ slug: product.slug, name: product.name, variant: variantLabel, quantity, price: product.price });
                setAdded(true);
                feedback("add");
              }}
            >{tr("Add to bag")}</Button>
          </div>

          <div aria-live="polite" className="mt-4 min-h-5">
            <AnimatePresence>
              {added && (
                <m.p
                  variants={safe ? successReveal : undefined}
                  initial="hidden"
                  animate="visible"
                  className="font-mono text-micro text-caramel-ink uppercase"
                >{count === 1 ? tr("Added · 1 item set aside in your bag") : tr("Added · {n} items set aside in your bag", { n: count })}</m.p>
              )}
            </AnimatePresence>
          </div>

          <BrewGuide product={product} roast={roast} className="mt-10 border-t border-sand pt-8" />
          <div className="mt-10 border-t border-sand pt-8">
            <ProductReviews product={product.slug} name={product.name} />
          </div>

          <ul aria-label={tr("Details")} className="mt-6 flex flex-wrap gap-2">
            {product.details.map((d) => (
              <li key={d}>
                <NoteChip>{tr(d)}</NoteChip>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
