import "server-only";
import type { Locale } from "../config";
import type { Messages } from "../translate";
import { TABLES } from "./tables/index";

export { translator, type Messages, type Translate } from "../translate";

/**
 * Page content translations, keyed by the English source text (the gettext
 * model): components write English and wrap it in `tr()`, and data strings
 * pass through `tr()` as they render. English needs no table — `tr` returns
 * its input — so English output is exactly the source and English pages carry
 * no translation payload. A missing entry falls back to English;
 * `npm run i18n:check` lists any gaps.
 *
 * Server-only: the root layout hands each page just its own language's table
 * (through the I18nProvider), so the tables never enter a client bundle.
 * Tables live in ./tables — one file per area, each English string next to its
 * Japanese, French and Italian, so reviewers see them side by side.
 */
export type Entry = { ja: string; fr: string; it: string };
export type Table = Readonly<Record<string, Entry>>;

function project(locale: Exclude<Locale, "en">): Messages {
  const out: Record<string, string> = {};
  for (const table of TABLES) for (const [en, entry] of Object.entries(table)) out[en] = entry[locale];
  return out;
}

export const MESSAGES: Record<Locale, Messages> = { en: {}, ja: project("ja"), fr: project("fr"), it: project("it") };
