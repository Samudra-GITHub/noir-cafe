import { FadeUp, Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { RevealImage } from "@/components/motion/RevealImage";
import { STORY_COLUMNS, STORY_IMAGES, STORY_QUOTE } from "@/data/story";
import { getTranslator } from "@/i18n/server";

/**
 * The founding chapter — pull quote beside two columns of storytelling, then
 * a pair of photographs revealed on scroll (the larger bleeds into the values
 * band below, as in the design).
 */
export async function StoryChapter() {
  const tr = await getTranslator();
  const { primary, secondary } = STORY_IMAGES;
  return (
    <section aria-label={tr("How Noir began")} className="bg-canvas pt-20 lg:pt-[108px]">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1fr_326px_326px] lg:gap-12">
          <FadeUp>
            <blockquote className="max-w-[440px] font-display text-[clamp(2.25rem,1.6rem+1.9vw,3.25rem)] leading-none text-strong">
              <p>{tr(STORY_QUOTE)}</p>
            </blockquote>
          </FadeUp>
          <Stagger className="contents">
            {STORY_COLUMNS.map((column, i) => (
              <StaggerItem key={i} className="flex flex-col gap-7 lg:pt-0.5">
                {column.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="font-sans text-body-sm leading-7 text-warm">
                    {tr(paragraph)}
                  </p>
                ))}
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="mt-16 grid gap-6 lg:mt-[114px] lg:grid-cols-[800px_1fr]">
          <RevealImage
            src={primary.src}
            alt={tr(primary.alt)}
            sizes="(min-width: 1280px) 800px, 100vw"
            className="aspect-[800/620]"
          />
          <figure className="lg:pt-2.5">
            <RevealImage
              src={secondary.src}
              alt={tr(secondary.alt)}
              sizes="(min-width: 1280px) 472px, 100vw"
              parallax={28}
              className="aspect-[472/497]"
            />
            <figcaption className="mt-[34px] flex items-baseline justify-between font-mono text-eyebrow uppercase">
              <span className="text-stone">{tr(secondary.caption)}</span>
              <span className="text-caramel-ink">{secondary.year}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
