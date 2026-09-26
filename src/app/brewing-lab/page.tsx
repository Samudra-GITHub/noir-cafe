import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BrewingLab } from "@/components/brewing/BrewingLab";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = pageMetadata({
  title: "Brewing Lab",
  description:
    "Five transformations, one expressive cup — follow a single lot from origin to pour, with live recipes, timers and brew guides.",
  path: "/brewing-lab",
});

export default function BrewingLabPage() {
  return (
    <PageTransition>
    <main className="pb-24 lg:pb-[115px]">
      <PageIntro
        eyebrow="Brewing lab · Method 01"
        title="Five transformations. One expressive cup."
        titleClassName="max-w-[630px]"
        lead="Follow a single lot from its place of origin to the final pour—measured, tasted, and refined at every stage."
      />
      <BrewingLab />
    </main>
    </PageTransition>
  );
}
