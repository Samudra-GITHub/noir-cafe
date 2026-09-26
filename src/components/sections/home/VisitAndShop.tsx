import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { BackgroundVideo, Button, Display, Eyebrow } from "@/components/ui";
import { VIDEOS } from "@/constants/media";

/** 06 · Visit + 07 · Objects for ritual — split panels. */
export function VisitAndShop() {
  return (
    <section aria-label="Visit and shop" className="grid lg:min-h-[680px] lg:grid-cols-2">
      <VisitPanel />
      <ShopPanel />
    </section>
  );
}

function VisitPanel() {
  return (
    <div
      className="relative isolate flex min-h-[520px] flex-col justify-between overflow-hidden bg-espresso p-[var(--gutter)] text-beige md:p-16"
    >
      <BackgroundVideo video={VIDEOS.ambienceCafe} className="-z-10">
        {/* Warm dark overlay keeps the copy legible over the film. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.45)_0%,rgb(23_18_14/0.35)_45%,rgb(23_18_14/0.78)_100%)]" />
        <div className="absolute inset-0 bg-walnut/25 mix-blend-multiply" />
      </BackgroundVideo>

      <Eyebrow tone="inverse" className="text-cream">
        06 · Visit
      </Eyebrow>

      <FadeUp>
        <Display as="h2" size="md" className="text-beige">
          Find your corner.
        </Display>
        <p className="mt-[26px] font-mono text-mono-sm text-cream uppercase">
          SoHo · Brooklyn · West Village
        </p>
        <Button href="/locations" variant="inverse" className="mt-[21px]">
          Our locations
        </Button>
      </FadeUp>
    </div>
  );
}

function ShopPanel() {
  return (
    <div className="flex flex-col bg-cream p-[var(--gutter)] md:p-16">
      <Eyebrow>07 · Objects for ritual</Eyebrow>

      <FadeUp className="mt-10 md:mt-[61px]">
        <Link
          href="/shop"
          tabIndex={-1}
          aria-hidden
          className="group/media relative block aspect-[592/350] overflow-hidden rounded-md bg-sand"
        >
          <Image
            src="/images/home/shop-ritual.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 592px, 100vw"
            className="object-cover transition-transform duration-700 ease-noir group-hover/media:scale-[1.03]"
          />
        </Link>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 md:mt-[69px]">
          <Display as="h2" size="heading" className="text-strong">
            Brew beautifully at home.
          </Display>
          <Button href="/shop" variant="secondary">
            Shop
          </Button>
        </div>
      </FadeUp>
    </div>
  );
}
