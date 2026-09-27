import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { Concierge } from "@/components/concierge/Concierge";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ask the barista",
  description: "Drink and bean recommendations, brewing advice, pairings and gift ideas from Noir Café's barista-concierge.",
  path: "/concierge",
});

export default function ConciergePage() {
  return (
    <PageTransition>
      <main>
        <Concierge />
      </main>
    </PageTransition>
  );
}
