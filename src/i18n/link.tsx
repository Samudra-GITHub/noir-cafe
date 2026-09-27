"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localePath } from "./config";
import { useI18n } from "./client";

/**
 * next/link that keeps visitors in their language: internal paths get the
 * current locale's prefix (English stays unprefixed; prefixed paths, hashes,
 * external and object hrefs pass through). Used in place of next/link across
 * the site so a Japanese visitor never bounces through a redirect.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { locale } = useI18n();
  const localized = typeof href === "string" && href.startsWith("/") && !href.startsWith("//") ? localePath(locale, href) : href;
  return <NextLink href={localized} {...props} />;
}
