import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/seo";
import { PageTransition } from "@/components/layout/PageTransition";
import { HomeHero } from "@/components/hero/HomeHero";
import { PreparationStory } from "@/components/hero/PreparationStory";
import { BrewingLabPreview } from "@/components/sections/home/BrewingLabPreview";
import { FeaturedDrinks } from "@/components/sections/home/FeaturedDrinks";
import { MostLoved } from "@/components/sections/home/MostLoved";
import { RitualIntro } from "@/components/sections/home/RitualIntro";
import { StoryPreview } from "@/components/sections/home/StoryPreview";
import { VisitAndShop } from "@/components/sections/home/VisitAndShop";

export const metadata: Metadata = pageMetadata({ description: DEFAULT_DESCRIPTION, path: "/" });

export default function HomePage() {
  return (
    <PageTransition>
    <main>
      {/* The hero pins beneath the page while the sections scroll up over it. */}
      <div className="relative">
        <HomeHero />
        <div className="relative z-10">
          <PreparationStory />
          <RitualIntro />
          <FeaturedDrinks />
          <MostLoved />
          <StoryPreview />
          <BrewingLabPreview />
          <VisitAndShop />
        </div>
      </div>
    </main>
    </PageTransition>
  );
}
