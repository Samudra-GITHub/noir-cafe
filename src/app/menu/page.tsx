import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { menuSchema } from "@/lib/schema";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { TodayAtTheBar } from "@/components/menu/TodayAtTheBar";
import { PageIntro } from "@/components/shared/PageIntro";
import { MENU_ALLERGY_NOTE, MENU_EXTRAS } from "@/data/menu";

export const metadata: Metadata = pageMetadata({
  title: "Menu",
  description:
    "Espresso, latte, cappuccino, matcha, tea and bakery — the Noir Café autumn menu, made slowly and served simply.",
  path: "/menu",
});

export default function MenuPage() {
  return (
    <PageTransition>
    <JsonLd data={menuSchema()} />
    <main>
      <PageIntro
        eyebrow="Menu · Autumn 2026"
        title="Made slowly. Served simply."
        lead="Our menu follows the harvest. Ask your barista about today’s single-origin espresso and filter selections."
      />
      <TodayAtTheBar />
      <MenuBrowser />

      <aside
        aria-label="Menu notes"
        className="mt-16 bg-cream lg:mt-[70px]"
      >
        <div className="container-page flex min-h-[111px] flex-col justify-center gap-3 py-8 md:flex-row md:items-center md:justify-between md:py-0">
          <p className="font-mono text-eyebrow text-stone uppercase">{MENU_EXTRAS}</p>
          <p className="font-sans text-body-xs text-strong italic">{MENU_ALLERGY_NOTE}</p>
        </div>
      </aside>
    </main>
    </PageTransition>
  );
}
