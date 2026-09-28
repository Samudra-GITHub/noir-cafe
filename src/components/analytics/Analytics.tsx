"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { optedOut } from "@/lib/analytics";
import type { AnalyticsConfig } from "./config";

const noop = () => () => {};

/**
 * Loads the configured analytics providers after the page is idle
 * (`lazyOnload`, so none of them touch LCP or input latency). Renders nothing
 * on the server, when no provider is configured, or when the visitor sends
 * Global Privacy Control / Do Not Track.
 */
export function Analytics({ config }: { config: AnalyticsConfig }) {
  const allowed = useSyncExternalStore(noop, () => !optedOut(), () => false);
  if (!allowed) return null;
  const { vercel, plausible, ga } = config;
  return (
    <>
      {vercel && (
        <>
          <Script id="va-queue" strategy="lazyOnload">{`window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)}`}</Script>
          <Script src="/_vercel/insights/script.js" strategy="lazyOnload" />
        </>
      )}
      {plausible && (
        <>
          <Script id="plausible-queue" strategy="lazyOnload">{`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}</Script>
          <Script src={plausible.src} data-domain={plausible.domain} strategy="lazyOnload" />
        </>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="lazyOnload" />
          <Script id="ga-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(ga)},{anonymize_ip:true});`}
          </Script>
        </>
      )}
    </>
  );
}

