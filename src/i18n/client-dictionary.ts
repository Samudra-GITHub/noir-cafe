import type { Dictionary } from "./dictionaries";

/** Namespaces only server components read — kept out of the client payload. */
const SERVER_ONLY = ["meta", "intro"] as const;
type ServerOnly = (typeof SERVER_ONLY)[number];

export type ClientDictionary = Omit<Dictionary, ServerOnly>;

export function clientDictionary(dict: Dictionary): ClientDictionary {
  const copy: Partial<Dictionary> = { ...dict };
  for (const key of SERVER_ONLY) delete copy[key];
  return copy as ClientDictionary;
}
