import { FadeUp, Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { DrinkCard } from "@/components/menu/DrinkCard";
import { MobileDrinkRail } from "@/components/menu/MobileDrinkRail";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { Button } from "@/components/ui";
import { FEATURED_DRINKS } from "@/data/drinks";
import { getTranslator } from "@/i18n/server";

/** 02 · Seasonal edit — three featured drinks. */
export async function FeaturedDrinks() {
  const tr = await getTranslator();
  return (
    <section aria-labelledby="featured-title" className="bg-cream py-20 md:pt-[98px] md:pb-24">
      <div className="container-page">
        <FadeUp className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionIntro
            id="featured-title"
            eyebrow={tr("02 · Seasonal edit")}
            gap="mt-[15px]"
            title={tr("Featured drinks")}
          />
          <Button href="/menu" variant="secondary" className="self-start md:self-auto">{tr("View all drinks")}</Button>
        </FadeUp>

        <MobileDrinkRail drinks={FEATURED_DRINKS} />
        <Stagger className="mt-12 hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_DRINKS.map((drink, i) => (
            <StaggerItem
              key={drink.slug}
              // Tablet: two-up, with the third card centred on its own row.
              className={
                i === 2
                  ? "md:max-xl:col-span-2 md:max-xl:w-[calc(50%-12px)] md:max-xl:justify-self-center"
                  : undefined
              }
            >
              <DrinkCard drink={drink} href={`/menu#${drink.slug}`} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
