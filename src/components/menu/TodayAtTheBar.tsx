import Image from "next/image";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button, Eyebrow } from "@/components/ui";
import { TODAY_AT_THE_BAR } from "@/data/menu";
import { getTranslator } from "@/i18n/server";

/**
 * "Today at the bar" — editorial feature row: 860 × 360 photograph beside a
 * 412px espresso panel naming the current single-origin.
 */
export async function TodayAtTheBar() {
  const tr = await getTranslator();
  const bar = TODAY_AT_THE_BAR;
  return (
    <FadeUp className="container-page mt-12 grid gap-6 lg:mt-[68px] lg:grid-cols-[1fr_412px]">
      <div className="group/media relative aspect-[860/360] overflow-hidden rounded-xl bg-cream max-lg:aspect-[16/10]">
        <Image
          src={bar.image}
          alt={tr(bar.imageAlt)}
          fill
          priority
          sizes="(min-width: 1280px) 860px, (min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-noir group-hover/media:scale-[1.03]"
        />
      </div>

      <section
        aria-labelledby="today-title"
        className="flex flex-col rounded-xl bg-espresso p-8 text-beige md:p-10"
      >
        <Eyebrow tone="accent-inverse">{tr(bar.eyebrow)}</Eyebrow>
        <h2 id="today-title" className="mt-[38px] font-display text-[2.375rem] leading-none">
          {bar.name[0]}
          <br />
          {bar.name[1]}
        </h2>
        <p className="mt-10 font-sans text-body-xs text-cream">{tr(bar.notes)}</p>
        <Button href="#espresso" variant="inverse" className="mt-10 self-start">{tr("Coffee details")}</Button>
      </section>
    </FadeUp>
  );
}
