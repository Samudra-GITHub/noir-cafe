import { ViewTransition } from "react";

/**
 * PageTitle — the page's H1 as a shared element. Between two pages that both
 * have one, the title morphs from the old position to the new with a short
 * typographic motion blur; arriving from a page without one, it slides in out
 * of a blur. At rest it is the plain heading.
 */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition name="page-title" share="title-morph" enter="title-in" exit="title-out" default="none">
      {children}
    </ViewTransition>
  );
}
