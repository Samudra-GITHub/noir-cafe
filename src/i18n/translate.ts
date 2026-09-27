import { fill } from "./format";

/**
 * `tr` — English source text in, the visitor's language out. Kept apart from
 * the translation tables so client code never bundles them: the page's own
 * table arrives through the I18nProvider (empty for English).
 */
export type Messages = Readonly<Record<string, string>>;

/**
 * `context` disambiguates one English word with two meanings (gettext's
 * msgctxt): tr("Brew", undefined, "action") is keyed "action|Brew".
 */
export type Translate = (english: string, vars?: Record<string, string | number> | null, context?: string) => string;

export function translator(messages: Messages): Translate {
  return (english, vars, context) => {
    const text = messages[context ? `${context}|${english}` : english] ?? english;
    return vars ? fill(text, vars) : text;
  };
}
