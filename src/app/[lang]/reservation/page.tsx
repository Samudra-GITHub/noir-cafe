import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { getDictionary, localizedMetadata } from "@/i18n/server";
import { ReservationExperience } from "@/components/reservation/ReservationExperience";
import { MobileReservation } from "@/components/reservation/MobileReservation";
import { PageIntro } from "@/components/shared/PageIntro";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("reservation", "/reservation");
}

export default async function ReservationPage() {
  const t = await getDictionary();
  return (
    <PageTransition>
    <main className="pb-24 lg:pb-[72px]">
      <PageIntro
        eyebrow={t.intro.reservation.eyebrow}
        title={t.intro.reservation.title}
        lead={t.intro.reservation.lead}
        className="lg:pt-[152px]"
        leadClassName="max-w-[310px] text-[0.875rem] leading-6 lg:mb-2"
      />
      <MobileReservation />
      <ReservationExperience />
    </main>
    </PageTransition>
  );
}
