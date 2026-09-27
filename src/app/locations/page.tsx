import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { cafesSchema } from "@/lib/schema";
import { LocationsExperience } from "@/components/locations/LocationsExperience";
import { NycWorld } from "@/components/locations/NycWorld";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = pageMetadata({
  title: "Locations",
  description: "Three Noir cafés in New York — Mercer Street in SoHo, Wythe Avenue in Brooklyn and West 10th in the West Village.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <PageTransition>
    <JsonLd data={cafesSchema()} />
    <main className="pb-24 lg:pb-[81px]">
      <PageIntro
        eyebrow="New York · Three rooms"
        title="A quiet corner, wherever you are."
        titleClassName="max-w-[720px]"
        lead="Each Noir café is shaped by its neighborhood, with the same coffee, materials, and generous sense of pause."
      />
      {/* Phones: New York, live; larger screens keep the designed map and cards. */}
      <NycWorld />
      <div className="hidden md:block">
        <LocationsExperience />
      </div>
    </main>
    </PageTransition>
  );
}
