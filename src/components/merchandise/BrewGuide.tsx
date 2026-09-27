import Link from "@/i18n/link";
import type { RoastLevel } from "@/components/ui";
import { BREW_METHODS, formatClock, type BrewMethod } from "@/data/brewing";
import type { ShopProduct } from "@/data/shop";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

/**
 * Which house recipes suit a product: beans by the roast being chosen (our
 * recipes name the roast they're written for), brewing kits and the ritual
 * set by the pour-overs they're made for. Drinkware and apparel have none.
 */
export function recipesFor(product: ShopProduct, roast?: RoastLevel): BrewMethod[] {
  if (product.category === "beans") return BREW_METHODS.filter((m) => m.roast === (roast ?? "Medium"));
  if (product.category === "brewing-kits" || product.category === "sets") return BREW_METHODS.filter((m) => m.id === "v60" || m.id === "chemex");
  return [];
}

/** Brew guide — our house recipes for this product, each one a tap from the Recipe Studio. */
export function BrewGuide({ product, roast, className }: { product: ShopProduct; roast?: RoastLevel; className?: string }) {
  const { tr } = useI18n();
  const recipes = recipesFor(product, roast);
  if (!recipes.length) return null;
  return (
    <section aria-labelledby={`${product.slug}-brew`} className={className}>
      <h4 id={`${product.slug}-brew`} className="font-display text-[1.75rem] text-strong">{tr("Brew guide")}</h4>
      <p className="mt-1 font-sans text-body-xs text-stone">
        {product.category === "beans" ? tr(`House recipes for a ${(roast ?? "Medium").toLowerCase()} roast.`) : tr("House recipes this is made for.")}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {recipes.map((m) => (
          <li key={m.id} className={cn("rounded-xl border border-sand p-4")}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-sans text-body-sm font-semibold text-strong">{tr(m.method)}</p>
              <Link
                href={`/brewing-lab/studio?method=${m.id}`}
                className="inline-flex min-h-11 items-center font-mono text-micro text-caramel-ink uppercase underline decoration-caramel/40 underline-offset-4"
              >{tr("Open in the studio")}</Link>
            </div>
            <dl className="mt-2 grid grid-cols-4 gap-2">
              {[
                [tr("Dose"), m.dose],
                [tr("Water"), tr(m.water)],
                [tr("Temp"), `${m.temperatureC}°C`],
                [tr("Time"), formatClock(m.totalSeconds)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-micro text-stone uppercase">{k}</dt>
                  <dd className="mt-0.5 font-sans text-body-xs text-strong">{v}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
