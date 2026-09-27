import "server-only";
import { BREW_METHODS } from "@/data/brewing";
import { CAFES } from "@/data/locations";
import { MENU, MENU_ALLERGY_NOTE, MENU_EXTRAS, TODAY_AT_THE_BAR } from "@/data/menu";
import { HOME_RITUAL_SET, PRODUCTS } from "@/data/shop";
import { SITE } from "@/constants/site";

const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * Everything the concierge may speak about, compiled from the site's own data
 * modules. The model is told to recommend only from this — so it can never
 * invent a drink, a product, a price or an opening hour.
 */
export function knowledge() {
  const menu = MENU.map(
    (c) =>
      `## ${c.title}\n` +
      c.items
        .map((i) => `- ${i.name} — ${i.description}; ${money(i.price)}; notes: ${i.notes.join(", ")}${i.roast ? `; ${i.roast.toLowerCase()} roast` : ""}${i.house ? "; house favourite" : ""}`)
        .join("\n"),
  ).join("\n");

  const shop = [...PRODUCTS, HOME_RITUAL_SET]
    .map(
      (p) =>
        `- ${p.name} (${p.spec}) — ${money(p.price)}. ${p.description} ${p.details.join("; ")}.` +
        (p.roasts ? ` Roasts: ${p.roasts.join(", ")}.` : "") +
        (p.variants.length ? ` Options: ${p.variants.map((v) => `${v.name}: ${v.options.join(" / ")}`).join("; ")}.` : "") +
        ` Origin: ${p.origin.points.map((o) => o.name).join(", ")}.`,
    )
    .join("\n");

  const recipes = BREW_METHODS.map(
    (m) =>
      `- ${m.method}: ${m.dose} coffee, ${m.water}, ${m.temperatureC}°C, grind ~${m.grindMicrons} µm, ${m.roast.toLowerCase()} roast (${m.roastNote}) Steps: ${m.stages
        .map((s) => `${Math.floor(s.at / 60)}:${String(s.at % 60).padStart(2, "0")} ${s.label} (${s.detail})`)
        .join("; ")}.`,
  ).join("\n");

  const cafes = CAFES.map((c) => `- ${c.cardName} (${c.label}): ${c.address.join(", ")}; open ${c.opens}–${c.closes} daily.`).join("\n");

  return `# The menu (prices in USD)
${menu}
Extras: ${MENU_EXTRAS}.
Today at the bar: ${TODAY_AT_THE_BAR.name.join(" ")} — ${TODAY_AT_THE_BAR.notes}.
Allergies: ${MENU_ALLERGY_NOTE}

# The shop
${shop}

# House brew recipes (Brewing Lab)
${recipes}

# Cafés (New York time)
${cafes}
Reservations: tables at ${SITE.address}; no charge; please cancel two hours ahead. Book at /reservation.
Contact: ${SITE.email}.`;
}
