import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { getDictionary, getLocale, localizedMetadata } from "@/i18n/server";
import { fill, formatMoney } from "@/i18n/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { menuSchema } from "@/lib/schema";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { TodayAtTheBar } from "@/components/menu/TodayAtTheBar";
import { PageIntro } from "@/components/shared/PageIntro";
import { EXTRA_SHOT_CENTS, OAT_CENTS } from "@/data/ordering";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("menu", "/menu");
}

export default async function MenuPage() {
  const t = await getDictionary();
  const locale = await getLocale();
  const extras = fill(t.menu.extras, { oat: formatMoney(OAT_CENTS / 100, locale), shot: formatMoney(EXTRA_SHOT_CENTS / 100, locale) });
  return (
    <PageTransition>
    <JsonLd data={menuSchema()} />
    <main>
      <PageIntro
        eyebrow={t.intro.menu.eyebrow}
        title={t.intro.menu.title}
        lead={t.intro.menu.lead}
      />
      <TodayAtTheBar />
      <MenuBrowser />

      <aside
        aria-label={t.a11y.menuNotes}
        className="mt-16 bg-cream lg:mt-[70px]"
      >
        <div className="container-page flex min-h-[111px] flex-col justify-center gap-3 py-8 md:flex-row md:items-center md:justify-between md:py-0">
          <p className="font-mono text-eyebrow text-stone uppercase">{extras}</p>
          <p className="font-sans text-body-xs text-strong italic">{t.menu.allergy}</p>
        </div>
      </aside>
    </main>
    </PageTransition>
  );
}
