export const SITE = {
  name: "Noir Café",
  address: "14 Mercer Street · New York",
  hours: "Mon–Sun · 07:00–20:00",
  year: 2026,
  email: "hello@noircafe.com",
  phone: "+1 (212) 555-0142",
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Pinterest", href: "https://pinterest.com", icon: "pinterest" },
  { label: "Spotify playlist", href: "https://open.spotify.com", icon: "spotify" },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Story", href: "/story" },
  { label: "Lab", href: "/brewing-lab" },
  { label: "Locations", href: "/locations" },
  { label: "Shop", href: "/shop" },
] as const;

export const RESERVE_HREF = "/reservation";

/** Secondary destinations, listed in the phone and tablet menu sheet. */
export const MORE_LINKS = [
  { label: "Order ahead", href: "/order" },
  { label: "Ask the barista", href: "/concierge" },
  { label: "Recipe studio", href: "/brewing-lab/studio" },
  { label: "From seed to cup · 3D", href: "/cup" },
] as const;

/**
 * First-visit loader ("Preparing your coffee…"). Shown once per session.
 * It costs roughly 10–20 points of Lighthouse mobile performance on a cold
 * first visit (the loader text becomes the LCP element); set to false to drop it.
 */
export const SHOW_LOADER = true;

/** Routes that open on a full-bleed dark hero — the nav starts in its dark glass there. */
export const DARK_HERO_ROUTES: readonly string[] = ["/", "/story", "/cup"];

export const FOOTER_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Journal", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Privacy", href: "#" },
] as const;

/** Mirrors the @theme breakpoints in app/globals.css. */
export const BREAKPOINTS = {
  md: 768,
  nav: 960, // "TABLET COLLAPSE AT 960"
  xl: 1280,
  desk: 1440,
} as const;
