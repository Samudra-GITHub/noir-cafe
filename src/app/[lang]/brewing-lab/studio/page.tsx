import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/server";
import { PageTransition } from "@/components/layout/PageTransition";
import { RecipeStudio } from "@/components/studio/RecipeStudio";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("studio", "/brewing-lab/studio");
}

export default function StudioPage() {
  return (
    <PageTransition>
      <main>
        <RecipeStudio />
      </main>
    </PageTransition>
  );
}
