import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { getDictionary, localizedMetadata } from "@/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { productsSchema } from "@/lib/schema";
import { ShopExperience } from "@/components/merchandise/ShopExperience";
import { PageIntro } from "@/components/shared/PageIntro";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("shop", "/shop");
}

export default async function ShopPage() {
  const t = await getDictionary();
  return (
    <PageTransition>
    <JsonLd data={productsSchema()} />
    <main className="pb-24 lg:pb-[140px]">
      <PageIntro
        eyebrow={t.intro.shop.eyebrow}
        title={t.intro.shop.title}
        titleClassName="max-w-[620px]"
        lead={t.intro.shop.lead}
      />
      <ShopExperience />
    </main>
    </PageTransition>
  );
}
