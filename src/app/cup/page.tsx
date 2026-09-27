import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { CupJourney } from "@/components/cup/CupJourney";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "From seed to cup, in 3D",
  description:
    "Five transformations, one expressive cup — follow Noir Café's coffee from seed to latte in an interactive 3D journey.",
  path: "/cup",
});

export default function CupPage() {
  return (
    <PageTransition>
      <main>
        <CupJourney />
      </main>
    </PageTransition>
  );
}
