import Image from "next/image";
import { FadeUp } from "@/components/motion/FadeUp";
import { ScrollZoom } from "@/components/motion/ScrollZoom";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { Button } from "@/components/ui";

/** 04 · Our story — roastery image (scroll zoom) beside the founding note. */
export function StoryPreview() {
  return (
    <section aria-labelledby="story-title" className="bg-canvas py-20 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[650px_1fr] lg:gap-[72px]">
        <ScrollZoom className="aspect-[4/3] lg:aspect-[650/720]">
          <Image
            src="/images/home/story-roaster.jpg"
            alt="Freshly roasted beans tumbling into the cooling tray of a drum roaster under a warm lamp"
            fill
            sizes="(min-width: 1024px) 650px, 100vw"
            className="object-cover"
          />
        </ScrollZoom>

        <FadeUp>
          <SectionIntro
            id="story-title"
            eyebrow="04 · Our story"
            size="xl"
            gap="mt-5"
            titleClassName="max-w-[420px] leading-[0.95]"
            title="Built around a long table and one shared obsession."
          />
          <p className="mt-8 max-w-[506px] font-sans text-body leading-[26px] text-stone">
            Noir began in 2018 as a tiny roastery behind a bookshop. Today, the same four questions
            guide us: Who grew it? What makes it distinct? How lightly can we intervene? And will you
            want another cup?
          </p>
          <Button href="/story" className="mt-7">
            Read our story
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}
