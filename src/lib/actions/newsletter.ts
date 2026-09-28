"use server";

import { headers } from "next/headers";
import { clientKey, rateLimit } from "@/server/rate-limit";

/** Outcomes are codes; the form shows them in the visitor's language. */
export type NewsletterState =
  | { status: "idle" }
  | { status: "error"; code: "invalid" | "busy"; email: string; at: number }
  | { status: "success" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up. Validates on the server; delivery to an email provider
 * is wired here once one is chosen. `at` lets the client replay feedback when
 * the same error is returned twice; `email` restores the field after React
 * resets the form.
 */
export async function subscribe(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  if (email.length > 254 || !EMAIL.test(email)) {
    return { status: "error", code: "invalid", email, at: Date.now() };
  }
  if (!rateLimit(`newsletter:${clientKey(await headers())}`, { limit: 5, windowMs: 10 * 60_000 })) {
    return { status: "error", code: "busy", email, at: Date.now() };
  }
  return { status: "success" };
}
