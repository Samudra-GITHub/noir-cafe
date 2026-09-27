import type { Metadata } from "next";
import Link from "next/link";
import { CAFES } from "@/data/locations";
import { SITE } from "@/constants/site";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/**
 * Served by the service worker when a page isn't saved and there is no
 * connection. The menu and the cafés are always kept for offline use.
 */
export default function OfflinePage() {
  return (
    <main className="container-page flex min-h-dvh flex-col justify-center pt-32 pb-32">
      <p className="font-mono text-eyebrow text-caramel-ink uppercase">Offline</p>
      <h1 className="type-display-lg mt-4 max-w-[640px] text-strong">No connection — the café is still here.</h1>
      <p className="mt-5 max-w-[460px] font-sans text-body-sm leading-[26px] text-stone">
        The menu and our cafés are saved on this device. Everything else will return with your connection.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/menu" className="inline-flex h-13 items-center rounded-full bg-espresso px-6 font-sans text-button font-semibold text-beige uppercase">
          Menu
        </Link>
        <Link href="/locations" className="inline-flex h-13 items-center rounded-full border border-espresso px-6 font-sans text-button font-semibold text-espresso uppercase">
          Locations
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 border-t border-sand pt-6 sm:grid-cols-3">
        {CAFES.map((c) => (
          <li key={c.id}>
            <p className="font-sans text-body-sm font-semibold text-strong">{c.cardName}</p>
            <p className="font-sans text-body-xs text-stone">{c.address.join(", ")}</p>
            <p className="mt-1 font-mono text-micro text-stone uppercase">Daily {c.opens}–{c.closes}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 font-mono text-micro text-stone uppercase">{SITE.email}</p>
    </main>
  );
}
