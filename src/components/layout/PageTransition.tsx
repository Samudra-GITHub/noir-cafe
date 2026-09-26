import { ViewTransition } from "react";

/**
 * PageTransition — wraps a route's content so navigations dissolve: the old
 * page blurs and fades out as the new one sharpens in (see `.page-dissolve`
 * in globals.css). Lives in each page.tsx, not the layout, because layouts
 * persist across navigations and never enter or exit.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-dissolve" exit="page-dissolve" default="none">
      {children}
    </ViewTransition>
  );
}
