import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/server";
import { StoryChapter } from "@/components/story/StoryChapter";
import { StoryHero } from "@/components/story/StoryHero";
import { StoryTimeline } from "@/components/story/StoryTimeline";
import { StoryValues } from "@/components/story/StoryValues";
import { MobileStoryJourney } from "@/components/story/MobileStoryJourney";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("story", "/story");
}

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
