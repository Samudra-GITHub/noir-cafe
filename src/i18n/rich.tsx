import { Fragment } from "react";

/**
 * Place elements inside a translated sentence: "…browse the {menu} and {shop}."
 * with { menu: <Link…/>, shop: <Link…/> }. Each language keeps its own word
 * order around the placeholders.
 */
export function rich(text: string, parts: Record<string, React.ReactNode>) {
  return text.split(/(\{\w+\})/).map((chunk, i) => {
    const key = /^\{(\w+)\}$/.exec(chunk)?.[1];
    return <Fragment key={i}>{key && key in parts ? parts[key] : chunk}</Fragment>;
  });
}
