import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Atmosphere } from "@/components/layout/Atmosphere";
import { ClientEnhancements } from "@/components/layout/ClientEnhancements";
import { GrainDissolve } from "@/components/layout/GrainDissolve";
import { LOADER_BOOT, Loader } from "@/components/layout/Loader";
import { SHOW_LOADER } from "@/constants/site";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Newsletter } from "@/components/shared/Newsletter";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SiteNav } from "@/components/navigation/SiteNav";
import { MobileDock } from "@/components/navigation/MobileDock";
import { AmbientAudioProvider } from "@/hooks/useAmbientAudio";
import { JsonLd } from "@/components/seo/JsonLd";
import { DEFAULT_DESCRIPTION, SITE_URL, pageMetadata } from "@/lib/seo";
import { organizationSchema } from "@/lib/schema";

// Upright cuts are preloaded — they paint the first screen. Italics and the
// mono only appear in small or below-the-fold type, so they load on demand
// (still swapped in) and stay off the mobile critical path.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const cormorantItalic = Cormorant_Garamond({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-cormorant-italic",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interItalic = Inter({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-inter-italic",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Noir Café — Specialty coffee, New York",
    template: "%s · Noir Café",
  },
  applicationName: "Noir Café",
  ...pageMetadata({ description: DEFAULT_DESCRIPTION, path: "/" }),
  appleWebApp: { capable: true, title: "Noir Café", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#17120e",
  // Draw under the notch and home indicator; safe areas are padded explicitly.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cormorantItalic.variable} ${inter.variable} ${interItalic.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {SHOW_LOADER && <script dangerouslySetInnerHTML={{ __html: LOADER_BOOT }} />}
        <JsonLd data={organizationSchema()} />
      </head>
      <body>
        {SHOW_LOADER && <Loader />}
        <AmbientAudioProvider>
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only z-[100] rounded-full bg-espresso px-5 py-3 font-sans text-button font-semibold text-beige uppercase focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
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
          <ClientEnhancements />
        </SmoothScroll>
        </AmbientAudioProvider>
      </body>
    </html>
  );
}
