import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "../globals.css";
import { Atmosphere } from "@/components/layout/Atmosphere";
import { ClientEnhancements } from "@/components/layout/ClientEnhancements";
import { GrainDissolve } from "@/components/layout/GrainDissolve";
import { TransitionDirector } from "@/components/layout/TransitionDirector";
import { PwaClient } from "@/components/pwa/PwaClient";
import { LOADER_BOOT, Loader } from "@/components/layout/Loader";
import { SHOW_LOADER } from "@/constants/site";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Newsletter } from "@/components/shared/Newsletter";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteNav } from "@/components/navigation/SiteNav";
import { MobileDock } from "@/components/navigation/MobileDock";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { clientDictionary } from "@/i18n/client-dictionary";
import { MESSAGES } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/client";
import { getLocale, localizedMetadata } from "@/i18n/server";
import { organizationSchema } from "@/lib/schema";
import SPLASH from "@/constants/splash.json";
import { EARLY_REVEAL } from "@/lib/early-reveal";
import { ATMOSPHERE_BOOT } from "@/lib/atmosphere-boot";

// Upright cuts are preloaded — they paint the first screen — and self-hosted
// with the weight axis trimmed to what the site renders (see src/fonts).
// Italics and the mono only appear in small or below-the-fold type, so they
// load on demand (still swapped in) and stay off the mobile critical path.
const cormorant = localFont({
  src: "../../fonts/cormorant-garamond-latin-wght400-500.woff2",
  weight: "400 500",
  style: "normal",
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const cormorantItalic = Cormorant_Garamond({
  subsets: ["latin"],
  style: "italic",
  weight: "400",
  variable: "--font-cormorant-italic",
  display: "swap",
  preload: false,
});

const inter = localFont({
  src: "../../fonts/inter-latin-wght400-600.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial",
});

const interItalic = Inter({
  subsets: ["latin"],
  style: "italic",
  weight: "400",
  variable: "--font-inter-italic",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

// Japanese: Noto Serif JP pairs with Cormorant for display, Noto Sans JP with
// Inter for text (Latin glyphs keep the brand faces — they lead the stack; see
// styles/tokens.css). The stylesheet is only requested on Japanese pages and is
// inserted without blocking render; display=optional means a face that isn't
// ready at first paint is simply used from the next view, so nothing shifts.
// Its unicode-range slices download only for the characters on the page.
const NOTO_JP =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500&family=Noto+Sans+JP:wght@400;500;600&display=optional";
const NOTO_JP_LOADER = `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href=${JSON.stringify(NOTO_JP)};document.head.appendChild(l)})()`;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Only the four locales exist; anything else under the root segment is a 404.
export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DICTIONARIES[locale].meta.siteTitle,
      template: "%s · Noir Café",
    },
    applicationName: "Noir Café",
    ...(await localizedMetadata(null, "/")),
  // Installed on iOS: full-bleed under the status bar, with branded launch screens (scripts/generate-splash.mjs).
  appleWebApp: { capable: true, title: "Noir Café", statusBarStyle: "black-translucent", startupImage: SPLASH },
  formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#17120e",
  // Draw under the notch and home indicator; safe areas are padded explicitly.
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = (await params).lang as Locale;
  const t = DICTIONARIES[locale];
  return (
    <html
      lang={locale}
      dir={LOCALE_META[locale].dir}
      className={`${cormorant.variable} ${cormorantItalic.variable} ${inter.variable} ${interItalic.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {SHOW_LOADER && <script dangerouslySetInnerHTML={{ __html: LOADER_BOOT }} />}
        <script dangerouslySetInnerHTML={{ __html: ATMOSPHERE_BOOT }} />
        <JsonLd data={organizationSchema()} />
        {locale === "ja" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <script dangerouslySetInnerHTML={{ __html: NOTO_JP_LOADER }} />
          </>
        )}
      </head>
      <body>
        {SHOW_LOADER && <Loader />}
        <I18nProvider locale={locale} t={clientDictionary(t)} messages={MESSAGES[locale]}>
        <MotionProvider>
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only z-[100] rounded-full bg-espresso px-5 py-3 font-sans text-button font-semibold text-beige uppercase focus:not-sr-only focus:fixed focus:top-4 focus:inset-s-4"
          >
            {t.a11y.skip}
          </a>
          <SiteNav />
          <MobileDock />
          <div id="main" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <Newsletter />
          <SiteFooter />
          <Atmosphere />
          <GrainDissolve />
          <TransitionDirector />
          <PwaClient />
          <ClientEnhancements />
        </SmoothScroll>
        </MotionProvider>
        </I18nProvider>
        <script dangerouslySetInnerHTML={{ __html: EARLY_REVEAL }} />
      </body>
    </html>
  );
}
