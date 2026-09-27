import type { Locale } from "../config";
import { en, type CoreDictionary } from "./en";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";

export type Dictionary = CoreDictionary;
export const DICTIONARIES: Record<Locale, Dictionary> = { en, ja, fr, it };
