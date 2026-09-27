"use client";

import { useEffect, useId, useState } from "react";
import { Button, Field } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useFormat, useI18n } from "@/i18n/client";

type Review = { id: string; name: string; rating: number; body: string; createdAt: string };
type Summary = { reviews: Review[]; count: number; average: number | null };

const STAR = "M10 1.6l2.47 5.3 5.8.68-4.29 3.97 1.14 5.73L10 14.4l-5.12 2.88 1.14-5.73L1.73 7.58l5.8-.68z";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width={size} height={size}>
          <path d={STAR} fill={i <= Math.round(value) ? "var(--noir-caramel)" : "var(--noir-sand)"} />
        </svg>
      ))}
    </span>
  );
}

const ERRORS: Record<string, string> = {
  rating_invalid: "Choose a rating from one to five.",
  name_required: "Add your name.",
  body_length: "Write between 10 and 800 characters.",
  rate_limited: "Too many reviews from here — please try later.",
};

/**
 * Reviews — only genuine, approved reviews are shown (none are ever invented).
 * With none yet, the section says so and invites the first. New reviews are
 * held for a quick look from the café before they appear.
 */
export function ProductReviews({ product, name }: { product: string; name: string }) {
  const { tr } = useI18n();
  const format = useFormat();
  const [data, setData] = useState<Summary | null>(null);
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [stored, setStored] = useState(true);
  const ids = { title: useId(), rating: useId(), body: useId() };

  useEffect(() => {
    let alive = true;
    fetch(`/api/reviews?product=${encodeURIComponent(product)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [product]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!rating) return setError(ERRORS.rating_invalid);
    setStatus("sending");
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, name: author, rating, body }) }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setStatus("idle");
      return setError(ERRORS[json.error] ?? "We couldn't send your review. Please try again.");
    }
    setStored(Boolean(json.stored));
    setStatus("sent");
  };

  return (
    <section aria-labelledby={ids.title}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h4 id={ids.title} className="font-display text-[1.75rem] text-strong">{tr("Reviews")}</h4>
          {data?.count ? (
            <p className="mt-1 flex items-center gap-2 font-sans text-body-xs text-stone">
              <Stars value={data.average ?? 0} />
              <span>
                {data.count === 1 ? tr("{average} out of 5 · 1 review", { average: data.average ?? 0 }) : tr("{average} out of 5 · {n} reviews", { average: data.average ?? 0, n: data.count })}
              </span>
            </p>
          ) : (
            <p className="mt-1 font-sans text-body-xs text-stone">{data ? tr("No reviews of the {name} yet.", { name: tr(name) }) : tr("Loading reviews…")}</p>
          )}
        </div>
        {!writing && status !== "sent" && (
          <button type="button" onClick={() => setWriting(true)} className="inline-flex min-h-11 items-center font-mono text-micro text-caramel-ink uppercase underline decoration-caramel/40 underline-offset-4">
            {data?.count ? tr("Write a review") : tr("Be the first")}
          </button>
        )}
      </div>

      {data?.reviews.length ? (
        <ul className="mt-4 border-t border-sand">
          {data.reviews.map((r) => (
            <li key={r.id} className="border-b border-sand py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-sans text-body-sm font-semibold text-strong">{r.name}</span>
                <span className="font-mono text-micro text-stone uppercase">{format.date(new Date(r.createdAt), { month: "short", year: "numeric" })}</span>
              </div>
              <span className="mt-1 block" role="img" aria-label={tr("{n} out of 5", { n: r.rating })}>
                <Stars value={r.rating} />
              </span>
              <p className="mt-2 font-sans text-body-sm text-warm">{r.body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {status === "sent" ? (
        <p role="status" className="mt-4 rounded-xl bg-cream p-4 font-sans text-body-sm text-warm">{tr("Thank you — reviews appear after a quick look from the café.")}{!stored && " "}{!stored && tr("(Demo mode: this review wasn't stored — reviews need Supabase.)")}
        </p>
      ) : (
        writing && (
          <form onSubmit={(e) => void submit(e)} noValidate className="mt-4 flex flex-col gap-5 rounded-xl border border-sand p-5">
            <fieldset>
              <legend id={ids.rating} className="font-mono text-micro text-stone uppercase">{tr("Your rating")}</legend>
              <div
                role="radiogroup"
                aria-labelledby={ids.rating}
                className="mt-2 flex gap-1"
                onKeyDown={(e) => {
                  const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
                  if (!step) return;
                  e.preventDefault();
                  const next = Math.min(5, Math.max(1, (rating || 0) + step));
                  setRating(next);
                  (e.currentTarget.querySelector(`[data-star="${next}"]`) as HTMLElement | null)?.focus();
                }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={rating === i}
                    aria-label={i === 1 ? tr("1 star") : tr("{n} stars", { n: i })}
                    tabIndex={rating === i || (!rating && i === 1) ? 0 : -1}
                    data-star={i}
                    onClick={() => setRating(i)}
                    className="grid size-11 place-items-center rounded-full"
                  >
                    <svg viewBox="0 0 20 20" width={24} height={24} aria-hidden>
                      <path d={STAR} className={cn("transition-colors", i <= rating ? "fill-caramel" : "fill-sand")} />
                    </svg>
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label={tr("Your name")} autoComplete="given-name" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={60} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.body} className="font-mono text-micro text-stone uppercase">{tr("Your review")}</label>
              <textarea
                id={ids.body}
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 800))}
                rows={4}
                className="rounded-lg border border-sand bg-surface p-3 font-sans text-body-sm text-strong focus:border-espresso"
              />
              <span className="self-end font-mono text-micro text-stone tabular-nums">{body.length}/800</span>
            </div>
            {error && (
              <p role="alert" className="font-sans text-body-sm text-caramel-ink">
                {tr(error)}
              </p>
            )}
            <Button type="submit" disabled={status === "sending"} className="self-start">
              {status === "sending" ? tr("Sending…") : tr("Send review")}
            </Button>
          </form>
        )
      )}
    </section>
  );
}
