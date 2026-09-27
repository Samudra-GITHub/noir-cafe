import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { StoryChapter } from "@/components/story/StoryChapter";
import { StoryHero } from "@/components/story/StoryHero";
import { StoryTimeline } from "@/components/story/StoryTimeline";
import { StoryValues } from "@/components/story/StoryValues";
import { MobileStoryJourney } from "@/components/story/MobileStoryJourney";

export const metadata: Metadata = pageMetadata({
  title: "Our Story",
  description:
    "Noir began in 2018 as a tiny roastery behind a bookshop on Mercer Street — a café born from a long conversation.",
  path: "/story",
});

export default function StoryPage() {
  return (
    <PageTransition>
    <main>
      <StoryHero />
      {/* Phones: the five-chapter journey; larger screens keep the designed story. */}
      <MobileStoryJourney />
      <div className="hidden md:block">
        <StoryChapter />
        <StoryValues />
        <StoryTimeline />
      </div>
    </main>
    </PageTransition>
  );
}
