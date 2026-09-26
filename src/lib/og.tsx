import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type Backdrop = "home" | "menu" | "story" | "lab" | "reservation" | "locations" | "shop";

/**
 * Branded share card: the page's photograph under a warm espresso wash, the
 * NOIR CAFÉ wordmark, a mono eyebrow and the page's Cormorant headline.
 * Rendered at build time for every route.
 */
export async function renderOg({ backdrop, eyebrow, title }: { backdrop: Backdrop; eyebrow: string; title: string }) {
  const [serif, mono, photo] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/CormorantGaramond-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/IBMPlexMono-Regular.ttf")),
    readFile(join(process.cwd(), `assets/og/${backdrop}.jpg`), "base64"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#17120e" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
        <img src={`data:image/jpeg;base64,${photo}`} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(90deg, rgba(23,18,14,0.92) 0%, rgba(23,18,14,0.7) 48%, rgba(23,18,14,0.25) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: "100%",
            color: "#f8f4ec",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, border: "2px solid #f8f4ec" }} />
            <div style={{ fontFamily: "Cormorant", fontSize: 32, letterSpacing: 1 }}>NOIR CAFÉ</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
            <div style={{ fontFamily: "Plex", fontSize: 20, color: "#b67a4b", textTransform: "uppercase", letterSpacing: 1 }}>
              {eyebrow}
            </div>
            <div style={{ fontFamily: "Cormorant", fontSize: 84, lineHeight: 0.95, marginTop: 20 }}>{title}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Cormorant", data: serif, style: "normal", weight: 400 },
        { name: "Plex", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
