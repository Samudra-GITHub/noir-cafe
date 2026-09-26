import { PageTransition } from "@/components/layout/PageTransition";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { productsSchema } from "@/lib/schema";
import { ShopExperience } from "@/components/merchandise/ShopExperience";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description: "Coffee, ceramics, and considered objects made for daily use. Small-batch, durable, and quietly beautiful.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <PageTransition>
    <JsonLd data={productsSchema()} />
    <main className="pb-24 lg:pb-[140px]">
      <PageIntro
        eyebrow="Objects for ritual · Edition 03"
        title="Good tools invite better mornings."
        titleClassName="max-w-[620px]"
        lead="Coffee, ceramics, and considered objects made for daily use. Small-batch, durable, and quietly beautiful."
      />
      <ShopExperience />
    </main>
    </PageTransition>
  );
}
