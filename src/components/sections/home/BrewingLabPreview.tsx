import { FadeUp, Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { Button, Eyebrow, StatusDot } from "@/components/ui";
import { BREW_STEPS } from "@/data/brewSteps";

/** 05 · Brewing lab — five transformations from terrain to table. */
export function BrewingLabPreview() {
  const last = BREW_STEPS.length - 1;

  return (
    <section aria-labelledby="lab-title" className="bg-surface py-20 md:pt-[104px] md:pb-[108px]">
      <div className="container-page">
        <FadeUp className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            id="lab-title"
            eyebrow="05 · Brewing lab"
            gap="mt-[15px]"
            title="From terrain to table."
          />
          <p className="max-w-[360px] font-sans text-[0.875rem] leading-6 text-stone">
            Five deliberate transformations. Nothing added. Nothing rushed.
          </p>
        </FadeUp>

        <hr className="mt-12 h-px border-0 bg-sand lg:mt-[70px]" />

        <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:mt-16 lg:flex lg:justify-between">
          {BREW_STEPS.map((step, i) => (
            <StaggerItem key={step.title} className="lg:w-[190px]">
              <Eyebrow as="p">{String(step.index).padStart(2, "0")}</Eyebrow>
              <StatusDot tone={i === last ? "accent" : "strong"} className="mt-[17px] block size-2.5" />
              <h3 className="mt-[18px] font-display text-heading-step text-strong">{step.title}</h3>
              <p className="mt-[17px] font-sans text-[0.75rem] leading-[19px] text-stone">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Button href="/brewing-lab" variant="secondary" className="mt-14 lg:mt-[61px]">
          Enter the lab
        </Button>
      </div>
    </section>
  );
}
