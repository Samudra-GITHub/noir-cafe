import Anthropic from "@anthropic-ai/sdk";
import { CONCIERGE_SYSTEM } from "@/server/concierge/prompt";
import { rateLimit } from "@/server/rate-limit";

/**
 * AI barista-concierge.
 *
 *   GET  → { available } — whether a model key is configured.
 *   POST → { messages: [{ role, content }] } → streamed plain text.
 *
 * The key stays on the server (ANTHROPIC_API_KEY); the model defaults to the
 * latest Claude and can be overridden with CONCIERGE_MODEL. Without a key the
 * route answers 503 and the UI shows the concierge as resting — there are no
 * canned replies.
 */

const MODEL = process.env.CONCIERGE_MODEL ?? "claude-opus-5-5";
const MAX_TURNS = 20;
const MAX_CHARS = 1200;

type Turn = { role: "user" | "assistant"; content: string };

function parse(body: unknown): Turn[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const m of messages) {
    const { role, content } = (m ?? {}) as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (!text) return null;
    turns.push({ role, content: text });
  }
  // Conversations start and end with the guest.
  return turns[0].role === "user" && turns[turns.length - 1].role === "user" ? turns : null;
}

export async function GET() {
  return Response.json({ available: Boolean(process.env.ANTHROPIC_API_KEY) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "offline" }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`concierge:${ip}`, { limit: 20, windowMs: 10 * 60_000 })) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let messages: Turn[] | null = null;
  try {
    messages = parse(await request.json());
  } catch {}
  if (!messages) return Response.json({ error: "bad_request" }, { status: 400 });

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 700,
    system: [{ type: "text", text: CONCIERGE_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("[concierge]", error instanceof Error ? error.message : error);
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
