import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { getDictionary, localizedMetadata } from "@/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { cafesSchema } from "@/lib/schema";
import { LocationsExperience } from "@/components/locations/LocationsExperience";
import { NycWorld } from "@/components/locations/NycWorld";
import { PageIntro } from "@/components/shared/PageIntro";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("locations", "/locations");
}

export default async function LocationsPage() {
  const t = await getDictionary();
  return (
    <PageTransition>
    <JsonLd data={cafesSchema()} />
    <main className="pb-24 lg:pb-[81px]">
      <PageIntro
        eyebrow={t.intro.locations.eyebrow}
        title={t.intro.locations.title}
        titleClassName="max-w-[720px]"
        lead={t.intro.locations.lead}
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
