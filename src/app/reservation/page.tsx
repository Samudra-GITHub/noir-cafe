import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ReservationExperience } from "@/components/reservation/ReservationExperience";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = pageMetadata({
  title: "Reserve a table",
  description: "Reserve a table at Noir Café Mercer Street for coffee, breakfast, or an unhurried afternoon.",
  path: "/reservation",
});

export default function ReservationPage() {
  return (
    <PageTransition>
    <main className="pb-24 lg:pb-[72px]">
      <PageIntro
        eyebrow="Reservations · Mercer Street"
        title="Your table, held quietly."
        lead="Reserve for coffee, breakfast, or an unhurried afternoon. Walk-ins are always welcome."
        className="lg:pt-[152px]"
        leadClassName="max-w-[310px] text-[0.875rem] leading-6 lg:mb-2"
      />
      <ReservationExperience />
    </main>
    </PageTransition>
  );
}
