/**
 * Page-transition choreography — which cinematic cut plays when arriving at
 * a route. The View Transitions CSS lives in app/globals.css ("Transitions
 * 2.0"); TransitionDirector tags <html data-vt> on each in-app link click.
 *
 *   liquid    the menu pours in — a wave line rises through the page
 *   steam     lab pages clear like steam — a soft edge lifts away
 *   stain     reservations bloom from your tap, like a coffee ring
 *   push      the full-bleed hero pages — a slow camera push
 *   dissolve  everything else, and browser back/forward — blur dissolve
 */
export type TransitionKind = "liquid" | "steam" | "stain" | "push" | "dissolve";

export function transitionFor(pathname: string): TransitionKind {
  if (pathname === "/menu") return "liquid";
  if (pathname.startsWith("/brewing-lab") || pathname === "/cup") return "steam";
  if (pathname === "/reservation") return "stain";
  if (pathname === "/" || pathname === "/story") return "push";
  return "dissolve";
}
