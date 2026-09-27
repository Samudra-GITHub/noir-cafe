import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/server";
import { PageTransition } from "@/components/layout/PageTransition";
import { Concierge } from "@/components/concierge/Concierge";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("concierge", "/concierge");
}

export default function ConciergePage() {
  return (
    <PageTransition>
      <main>
        <Concierge />
      </main>
    </PageTransition>
  );
}
