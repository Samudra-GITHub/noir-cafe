"use server";

export type NewsletterState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string; at: number }
  | { status: "success"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up. Validates on the server; delivery to an email provider
 * is wired here once one is chosen. `at` lets the client replay feedback when
 * the same error is returned twice; `email` restores the field after React
 * resets the form.
 */
export async function subscribe(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL.test(email)) {
    return { status: "error", message: "Enter a valid email address", email, at: Date.now() };
  }
  return { status: "success", message: "You’re on the list — the next note is yours" };
}
