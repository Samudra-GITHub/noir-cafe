import { FadeUp, Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { STORY_VALUES } from "@/data/story";

/** What stays constant — the three values as an indexed, ruled list. */
export function StoryValues() {
  return (
    <section aria-labelledby="values-title" className="bg-cream pt-20 pb-20 lg:pt-28 lg:pb-[111px]">
      <div className="container-page grid gap-10 lg:grid-cols-[492px_1fr] lg:gap-0">
        <FadeUp className="lg:pt-[3px]">
          <SectionIntro id="values-title" eyebrow="What stays constant" gap="mt-[13px]" title="Care is the craft." />
        </FadeUp>

        <Stagger as="ol" className="border-t border-sand">
            {STORY_VALUES.map((value, i) => (
              <StaggerItem
                as="li"
                key={value.title}
                className="group/value grid min-h-[86px] grid-cols-[56px_1fr] gap-y-2 border-b border-sand pt-[25px] pb-6 last:border-b-0 md:grid-cols-[72px_218px_1fr] md:pb-0"
              >
                  <span aria-hidden className="mt-1 font-mono text-eyebrow text-caramel-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-heading-sm leading-[1.2] text-strong transition-transform duration-500 ease-noir group-hover/value:translate-x-1">
                    {value.title}
                  </h3>
                  <p className="col-start-2 font-sans text-body-xs leading-[20.8px] text-stone md:col-start-3">
                    {value.text}
                  </p>
              </StaggerItem>
            ))}
        </Stagger>
      </div>
    </section>
  );
}
