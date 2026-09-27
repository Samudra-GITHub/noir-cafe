import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, negotiate } from "@/i18n/config";

/**
 * Proxy — language routing for every page, plus Clerk on the ordering routes.
 *
 * Language priority: the visitor's saved choice (cookie) → the browser's
 * preferred languages → English. English lives at unprefixed URLs (/menu,
 * rewritten internally to /en/menu); Japanese, French and Italian live under
 * /ja, /fr, /it and unprefixed requests redirect there. Visiting a prefixed
 * URL remembers that language.
 */
const YEAR = 60 * 60 * 24 * 365;

function remember(res: NextResponse, req: NextRequest, locale: string) {
  if (req.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR, sameSite: "lax" });
  }
  return res;
}

function localeRouting(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const first = pathname.split("/")[1];
  if (isLocale(first)) {
    // /en/... is the internal form of English — send people to the canonical unprefixed URL
    // (generated metadata images under /en are served as they are).
    if (first === DEFAULT_LOCALE && !pathname.includes("/opengraph-image")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.slice(3) || "/";
      return remember(NextResponse.redirect(url, 308), req, DEFAULT_LOCALE);
    }
    return remember(NextResponse.next(), req, first);
  }

  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : (negotiate(req.headers.get("accept-language")) ?? DEFAULT_LOCALE);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  if (locale === DEFAULT_LOCALE) {
    const res = NextResponse.rewrite(url);
    res.headers.set("Vary", "Cookie, Accept-Language");
    return res;
  }
  return NextResponse.redirect(url, 307);
}

const clerk = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerk ? clerkMiddleware((_auth, req) => localeRouting(req)) : localeRouting;

export const config = {
  matcher: [
    // Every page and RSC request — not build assets, public files (anything with an extension) or APIs…
    "/((?!_next/|api/|.*\\.[\\w]+$).*)",
    // …except the APIs Clerk needs to see.
    "/api/orders/:path*",
    "/api/favorites",
  ],
};
