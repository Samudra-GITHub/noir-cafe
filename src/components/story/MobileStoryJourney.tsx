import Image from "next/image";
import { BackgroundVideo } from "@/components/ui";
import { VIDEOS, type VideoAsset } from "@/constants/media";
import { JOURNEY } from "@/data/journey";
import { PRODUCTS } from "@/data/shop";
import { STORY_COLUMNS, STORY_IMAGES, STORY_QUOTE, STORY_TIMELINE, STORY_VALUES } from "@/data/story";

/**
 * The story on phones — a cinematic editorial journey in five chapters:
 * Origin, Farmers, Roasting, Brewing, Ritual. Each chapter pins a full-screen
 * photograph or film while its words scroll over it; the media drifts with
 * the scroll (CSS scroll-driven animation where supported), and a warm veil
 * dissolves one chapter into the next. Pull quotes and the founding timeline
 * sit between chapters. Every word comes from the story, journey, values and
 * shop data — nothing is written for this layout alone.
 */

const chapter = (id: (typeof JOURNEY)[number]["id"]) => JOURNEY.find((c) => c.id === id)!;
const value = (title: string) => STORY_VALUES.find((v) => v.title === title)!;

/** Growing regions named in the shop's beans (not the roastery). */
const ORIGINS = [
  ...new Set(
    PRODUCTS.filter((p) => p.category === "beans")
      .flatMap((p) => p.origin.points.map((o) => o.name))
      .filter((n) => !/New York/.test(n)),
  ),
];

/** The pull line from the second story column: "…know the producer, taste the harvest, make the cup worthy of both." */
const PRODUCER_LINE = "…" + STORY_COLUMNS[1][0].slice(STORY_COLUMNS[1][0].indexOf("know the producer"));

type Media = { kind: "video"; video: VideoAsset } | { kind: "image"; src: string; alt: string };

function Chapter({
  index,
  name,
  title,
  media,
  children,
}: {
  index: number;
  name: string;
  title: string;
  media: Media;
  children: React.ReactNode;
}) {
  const id = `story-${name.toLowerCase()}`;
  return (
    <section aria-labelledby={id} className="story-chapter relative bg-espresso text-beige" style={{ height: "170svh" }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="story-media absolute inset-0">
          {media.kind === "video" ? (
            <BackgroundVideo video={media.video} />
          ) : (
            <Image src={media.src} alt={media.alt} fill sizes="100vw" className="object-cover" />
          )}
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.35)_0%,rgb(23_18_14/0.15)_40%,rgb(23_18_14/0.88)_100%)]" />
        <div aria-hidden className="story-veil absolute inset-0 bg-espresso" />
      </div>
      <div className="relative -mt-[100svh] flex min-h-[170svh] flex-col justify-end px-[var(--gutter)] pb-[calc(var(--dock-height)+48px+var(--safe-bottom))]">
        <p className="font-mono text-eyebrow text-caramel-glow uppercase">
          {String(index).padStart(2, "0")} · {name}
        </p>
        <h2 id={id} className="mt-3 font-display text-[2.75rem] leading-[1] text-beige">
          {title}
        </h2>
        <div className="mt-5 flex max-w-[34ch] flex-col gap-4 font-sans text-body-sm leading-[25px] text-cream">{children}</div>
      </div>
    </section>
  );
}

function Quote({ children, cite }: { children: React.ReactNode; cite?: string }) {
  return (
    <figure className="story-quote bg-canvas px-[var(--gutter)] py-20">
      <blockquote className="font-display text-[2.25rem] leading-[1.1] text-strong">{children}</blockquote>
      {cite && <figcaption className="mt-5 font-mono text-eyebrow text-caramel-ink uppercase">{cite}</figcaption>}
    </figure>
  );
}

export function MobileStoryJourney() {
  const origin = chapter("origin");
  const brew = chapter("brew");
  const extract = chapter("extract");
  const cup = chapter("cup");
  return (
    <div className="md:hidden">
      <Quote cite="Late 2017">{STORY_QUOTE}</Quote>

      <Chapter index={1} name="Origin" title={origin.title} media={{ kind: "video", video: VIDEOS.coffeeBeans }}>
        <p>{origin.text}</p>
        <p>{STORY_COLUMNS[0][0]}</p>
      </Chapter>

      <Chapter index={2} name="Farmers" title={value("Provenance").title} media={{ kind: "image", src: STORY_IMAGES.primary.src, alt: STORY_IMAGES.primary.alt }}>
        <p>{value("Provenance").text}</p>
        <ul aria-label="Where our beans grow" className="flex flex-wrap gap-2">
          {ORIGINS.map((o) => (
            <li key={o} className="rounded-full border border-beige/30 px-3 py-1.5 font-mono text-micro text-beige uppercase">
              {o}
            </li>
          ))}
        </ul>
      </Chapter>

      <Quote>{PRODUCER_LINE}</Quote>

      <Chapter index={3} name="Roasting" title={value("Restraint").text} media={{ kind: "image", src: STORY_IMAGES.secondary.src, alt: STORY_IMAGES.secondary.alt }}>
        <p>{STORY_COLUMNS[0][1]}</p>
        <p className="font-mono text-micro text-taupe uppercase">
          {STORY_IMAGES.secondary.caption} · {STORY_IMAGES.secondary.year}
        </p>
      </Chapter>

      {/* The founding timeline, swiped year by year. */}
      <section aria-labelledby="story-timeline" className="bg-canvas py-16">
        <h2 id="story-timeline" className="px-[var(--gutter)] font-mono text-eyebrow text-caramel-ink uppercase">
          Since {STORY_TIMELINE[0].year}
        </h2>
        {/* Focusable so keyboard users can scroll the rail with the arrow keys. */}
        <ol tabIndex={0} aria-label="Timeline, swipe or use arrow keys" className="swipe-rail mt-6 gap-3 px-[var(--gutter)] outline-none focus-visible:ring-2 focus-visible:ring-caramel [&>*]:snap-start">
          {STORY_TIMELINE.map((t, i) => (
            <li key={t.year} className="w-[74vw] rounded-xl border border-sand bg-surface p-5">
              <p className="font-display text-[3rem] leading-none text-strong">{t.year}</p>
              <p className="mt-4 font-sans text-body-sm font-semibold text-strong">{t.title}</p>
              <p className="mt-1 font-sans text-body-xs text-stone">{t.text}</p>
              <span aria-hidden className="mt-5 block h-0.5 rounded-full bg-sand">
                <span className="block h-full rounded-full bg-caramel" style={{ width: `${((i + 1) / STORY_TIMELINE.length) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Chapter index={4} name="Brewing" title={brew.title} media={{ kind: "video", video: VIDEOS.pourOver }}>
        <p>{brew.text}</p>
        <p>
          <span className="font-display text-[1.5rem] leading-none text-beige">{extract.title}</span>
          <br />
          {extract.text}
        </p>
      </Chapter>

      <Chapter index={5} name="Ritual" title={cup.title} media={{ kind: "video", video: VIDEOS.latteArt }}>
        <p>{cup.text}</p>
        <p>{STORY_COLUMNS[1][0]}</p>
        <p>{value("Hospitality").text}</p>
      </Chapter>

      {/* The three values, whole. */}
      <section aria-labelledby="story-values" className="bg-canvas px-[var(--gutter)] pt-16">
        <h2 id="story-values" className="sr-only">
          Our values
        </h2>
        <ol className="border-t border-sand">
          {STORY_VALUES.map((v, i) => (
            <li key={v.title} className="flex gap-5 border-b border-sand py-5">
              <span className="font-mono text-eyebrow text-caramel-ink">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-display text-[1.75rem] leading-none text-strong">{v.title}</span>
                <span className="mt-2 block font-sans text-body-sm text-stone">{v.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Quote>{STORY_COLUMNS[1][1]}</Quote>
    </div>
  );
}
