import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/server";
import { PageTransition } from "@/components/layout/PageTransition";
import { CupJourney } from "@/components/cup/CupJourney";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("cup", "/cup");
}

export default function CupPage() {
  return (
    <PageTransition>
      <main>
        <CupJourney />
      </main>
    </PageTransition>
  );
}
