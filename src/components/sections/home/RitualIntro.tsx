import { FadeUp } from "@/components/motion/FadeUp";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { getTranslator } from "@/i18n/server";

/** 01 · The daily ritual — editorial statement with the team's note. */
export async function RitualIntro() {
  const tr = await getTranslator();
  return (
    <section
      aria-labelledby="ritual-title"
      className="bg-canvas pt-20 pb-24 md:pt-[112px] md:pb-[132px]"
    >
      <div className="container-page flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <FadeUp className="lg:mt-[19px]">
          <SectionIntro
            id="ritual-title"
            eyebrow={tr("01 · The daily ritual")}
            size="xl"
            gap="mt-[15px]"
            titleClassName="max-w-[620px]"
            title={tr("Coffee should slow time, not fill it.")}
          />
        </FadeUp>

        <FadeUp delay={0.12} className="lg:w-[420px]">
          <p className="font-sans text-[1.125rem] leading-[1.6] text-walnut md:text-[1.25rem] md:leading-[31px]">{tr("We work with smallholder lots, roast in considered batches, and make every drink to reveal its origin.")}</p>
          <p className="mt-[22px] font-display text-[1.375rem] leading-[1.2] text-caramel-ink italic">{tr("— The Noir team")}</p>
        </FadeUp>
      </div>
    </section>
  );
}
