"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import Link from "@/i18n/link";
import { ArrowUp, Square } from "lucide-react";
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; error?: boolean };

type Status = "checking" | "ready" | "offline";

/** Inline formatting: **bold** and site paths (/menu, /shop…) become links. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|(?<![\w/])\/[a-z][a-z0-9/-]*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-semibold text-strong">{part.slice(2, -2)}</strong>;
        if (/^\/[a-z][a-z0-9/-]*$/.test(part))
          return (
            <Link key={i} href={part} className="text-caramel-ink underline decoration-caramel/40 underline-offset-2">
              {part}
            </Link>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Paragraphs and simple "- " lists. */
function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, b) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return (
            <ul key={b} className="mt-2 flex list-disc flex-col gap-1 ps-5 first:mt-0">
              {lines.map((l, i) => (
                <li key={i}>
                  <Inline text={l.replace(/^\s*[-•]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        return (
          <p key={b} className="mt-2 first:mt-0">
            {lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                <Inline text={l} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

/**
 * Chat — a reusable streaming chat surface.
 *
 * Talks to `endpoint` (GET → { available }, POST { messages } → streamed text).
 * Streams replies as they are written, can stop mid-reply, and announces each
 * finished reply once to screen readers (the log itself stays quiet while
 * text streams). Enter sends; Shift+Enter adds a line.
 */
export function Chat({
  endpoint,
  label,
  intro,
  offline,
  suggestions = [],
  placeholder,
  locale,
  renderExtras,
  className,
}: {
  endpoint: string;
  /** Accessible name for the conversation. */
  label: string;
  /** Shown before the first message (static copy, not a model reply). */
  intro: React.ReactNode;
  /** Shown when the endpoint has no model configured. */
  offline: React.ReactNode;
  suggestions?: string[];
  placeholder?: string;
  /** The visitor's language — the model replies in it. */
  locale?: string;
  /** Extra UI under an assistant reply (e.g. cards for items it mentions). */
  renderExtras?: (message: ChatMessage) => React.ReactNode;
  className?: string;
}) {
  const { tr } = useI18n();
  const hint = placeholder ?? tr("Type a message");
  const [status, setStatus] = useState<Status>("checking");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const inputId = useId();

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d: { available?: boolean }) => setStatus(d.available ? "ready" : "offline"))
      .catch(() => {
        if (!controller.signal.aborted) setStatus("offline");
      });
    return () => controller.abort();
  }, [endpoint]);

  // Follow the conversation unless the guest has scrolled up to reread.
  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const update = (id: string, patch: (m: ChatMessage) => ChatMessage) =>
    setMessages((all) => all.map((m) => (m.id === id ? patch(m) : m)));

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming || status !== "ready") return;
    feedback("add");
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const reply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };
    const history = [...messages.filter((m) => !m.error), user];
    setMessages([...messages, user, reply]);
    setDraft("");
    setStreaming(true);
    pinned.current = true;
    const controller = new AbortController();
    abort.current = controller;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), locale }),
        signal: controller.signal,
      });
      if (res.status === 503) {
        setStatus("offline");
        setMessages((all) => all.filter((m) => m.id !== reply.id));
        return;
      }
      if (!res.ok || !res.body) {
        const why = res.status === 429 ? tr("So many questions at once — give me a minute and ask again.") : tr("I couldn't reach the bar just now. Please try again in a moment.");
        update(reply.id, (m) => ({ ...m, content: why, error: true }));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        update(reply.id, (m) => ({ ...m, content: full }));
      }
      setAnnouncement(full);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        update(reply.id, (m) => (m.content ? m : { ...m, content: tr("Stopped."), error: true }));
      } else {
        update(reply.id, (m) => ({ ...m, content: tr("The connection dropped. Please try again."), error: true }));
      }
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  };

  const empty = messages.length === 0;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        role="log"
        aria-label={label}
        aria-live="off"
        aria-busy={streaming}
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-1 py-4"
        data-lenis-prevent
      >
        <div className="rounded-xl bg-cream p-5 font-sans text-body-sm leading-[24px] text-warm">{status === "offline" ? offline : intro}</div>
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ms-auto max-w-[85%] rounded-2xl rounded-ee-md bg-espresso px-4 py-3 font-sans text-body-sm leading-[22px] text-beige">
              {m.content}
            </div>
          ) : (
            <div key={m.id} className="max-w-[92%]">
              <div className={cn("font-sans text-body-sm leading-[24px]", m.error ? "text-stone italic" : "text-warm")}>
                {m.content ? <Rich text={m.content} /> : <span className="inline-flex gap-1" aria-label={tr("Writing")}>{[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-caramel motion-safe:animate-pulse" style={{ animationDelay: `${i * 160}ms` }} />)}</span>}
              </div>
              {!m.error && m.content && !(streaming && m.id === messages[messages.length - 1].id) && renderExtras?.(m)}
            </div>
          ),
        )}
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>

      {empty && status === "ready" && suggestions.length > 0 && (
        <ul aria-label={tr("Suggestions")} className="swipe-rail -mx-[var(--gutter)] gap-2 px-[var(--gutter)] pb-3 md:mx-0 md:flex-wrap md:px-0 [&>*]:snap-start">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => void send(s)}
                className="h-10 rounded-full border border-sand bg-surface px-4 font-sans text-body-xs whitespace-nowrap text-strong transition-colors hover:border-espresso"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="flex items-end gap-2 rounded-[26px] border border-sand bg-surface p-2 focus-within:border-espresso"
      >
        <label htmlFor={inputId} className="sr-only">
          {hint}
        </label>
        <textarea
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 1200))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send(draft);
            }
          }}
          rows={1}
          placeholder={status === "offline" ? tr("The concierge is resting") : hint}
          disabled={status !== "ready"}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 font-sans text-body-sm text-strong outline-none [field-sizing:content] placeholder:text-stone disabled:opacity-60"
        />
        {streaming ? (
          <button type="button" onClick={() => abort.current?.abort()} aria-label={tr("Stop the reply")} className="grid size-11 shrink-0 place-items-center rounded-full bg-espresso text-beige">
            <Square aria-hidden className="size-3.5 fill-current" />
          </button>
        ) : (
          <button type="submit" aria-label={tr("Send")} disabled={!draft.trim() || status !== "ready"} className="grid size-11 shrink-0 place-items-center rounded-full bg-espresso text-beige transition-opacity disabled:opacity-30">
            <ArrowUp aria-hidden className="size-4" strokeWidth={2} />
          </button>
        )}
      </form>
    </div>
  );
}
