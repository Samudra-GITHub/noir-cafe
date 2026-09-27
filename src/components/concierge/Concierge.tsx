"use client";

import Image from "next/image";
import Link from "next/link";
import { Chat, type ChatMessage } from "@/components/chat/Chat";
import { Eyebrow } from "@/components/ui";
import { MENU } from "@/data/menu";
import { HOME_RITUAL_SET, PRODUCTS } from "@/data/shop";

type Mention = { name: string; detail: string; price: number; href: string; image?: string };

// Everything the barista might name, longest first so "Classic Latte" wins over "Latte".
const CATALOGUE: Mention[] = [
  ...MENU.flatMap((c) => c.items.map((i) => ({ name: i.name, detail: `${c.title} · ${i.notes.join(", ")}`, price: i.price, href: "/menu" }))),
  ...[...PRODUCTS, HOME_RITUAL_SET].map((p) => ({ name: p.name, detail: p.spec, price: p.price, href: "/shop", image: p.image })),
].sort((a, b) => b.name.length - a.name.length);

function mentions(text: string) {
  const found: (Mention & { at: number })[] = [];
  let rest = text;
  for (const item of CATALOGUE) {
    const re = new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const match = re.exec(rest);
    if (match) {
      found.push({ ...item, at: match.index });
      rest = rest.replace(new RegExp(re.source, "gi"), (m) => " ".repeat(m.length)); // keep positions
    }
  }
  // In the order the barista mentioned them.
  return found.sort((a, b) => a.at - b.at).slice(0, 3);
}

function MentionCards({ message }: { message: ChatMessage }) {
  const items = mentions(message.content);
  if (!items.length) return null;
  return (
    <ul aria-label="Mentioned" className="mt-3 flex flex-col gap-2">
      {items.map((m) => (
        <li key={m.name}>
          <Link href={m.href} className="flex items-center gap-3 rounded-xl border border-sand bg-surface p-2.5 pr-4 transition-colors hover:border-espresso">
            {m.image ? (
              <Image src={m.image} alt="" width={48} height={48} className="size-12 rounded-lg object-cover" />
            ) : (
              <span aria-hidden className="grid size-12 place-items-center rounded-lg bg-cream font-display text-[1.25rem] text-caramel-ink">
                {m.name[0]}
              </span>
            )}
            <span className="flex flex-1 flex-col">
              <span className="font-sans text-body-sm font-semibold text-strong">{m.name}</span>
              <span className="font-sans text-body-xs text-stone">{m.detail}</span>
            </span>
            <span className="font-mono text-eyebrow text-strong tabular-nums">${m.price.toFixed(2)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The AI barista-concierge: recommendations from the menu and the shop,
 * brewing advice, pairings and gift ideas — in the voice of the bar. Replies
 * come live from the model (app/api/concierge), grounded in the site's data.
 */
export function Concierge() {
  return (
    <div className="container-page flex h-[calc(100dvh-var(--dock-height)-28px-var(--safe-bottom))] max-w-[760px] flex-col pt-[calc(var(--safe-top)+96px)] pb-4 md:h-dvh md:pt-32 md:pb-10">
      <header className="shrink-0">
        <Eyebrow>Concierge</Eyebrow>
        <h1 className="type-display-md mt-3 text-strong">Ask the barista</h1>
      </header>
      <Chat
        endpoint="/api/concierge"
        label="Conversation with the barista"
        className="mt-4 flex-1"
        placeholder="Ask about drinks, beans, brewing, gifts…"
        intro={
          <>
            Tell me what you feel like — bright or chocolatey, hot or iced, a gift under a certain budget — and I&rsquo;ll suggest something from
            our menu and shop. I can help you dial in a brew at home too.
          </>
        }
        offline={
          <>
            The concierge is resting at the moment. Our baristas are happy to help in person, or browse the <Link href="/menu" className="underline">menu</Link> and{" "}
            <Link href="/shop" className="underline">shop</Link>.
          </>
        }
        suggestions={[
          "Recommend a drink for a slow afternoon",
          "Which beans should I brew on a V60?",
          "What pairs with a cortado?",
          "A gift under $40",
          "My pour-over tastes sour",
        ]}
        renderExtras={(m) => <MentionCards message={m} />}
      />
      <p className="mt-3 shrink-0 font-sans text-body-xs text-stone">
        Answers are written by AI from our menu and shop. For allergies, please speak with the barista.
      </p>
    </div>
  );
}
