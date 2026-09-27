import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { getDictionary, localizedMetadata } from "@/i18n/server";
import { BrewingLab } from "@/components/brewing/BrewingLab";
import { PageIntro } from "@/components/shared/PageIntro";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("brewingLab", "/brewing-lab");
}

export default async function BrewingLabPage() {
  const t = await getDictionary();
  return (
    <PageTransition>
    <main className="pb-24 lg:pb-[115px]">
      <PageIntro
        eyebrow={t.intro.brewingLab.eyebrow}
        title={t.intro.brewingLab.title}
        titleClassName="max-w-[630px]"
        lead={t.intro.brewingLab.lead}
      />
      <BrewingLab />
    </main>
    </PageTransition>
  );
}
