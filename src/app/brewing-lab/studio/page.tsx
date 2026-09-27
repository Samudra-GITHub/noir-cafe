import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { RecipeStudio } from "@/components/studio/RecipeStudio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Recipe Studio",
  description:
    "Experiment with our house brew recipes — dose, ratio, grind, water and roast — and watch extraction, flavour and the cup change in real time.",
  path: "/brewing-lab/studio",
});

export default function StudioPage() {
  return (
    <PageTransition>
      <main>
        <RecipeStudio />
      </main>
    </PageTransition>
  );
}
