import { pickProvider, ProviderError, type ChatMessage } from "./ai/index.js";
import { clientIp, json as jsonBody, rateLimiter, sameOrigin } from "./http.js";

// POST /api/chat: { messages, lang } → the reply streamed as plain UTF-8 text.
// Failures before the first token are JSON { error } with a status:
//   not_configured 503 · rate_limited 429 · bad_request 400 · forbidden 403/405 · error 502.
// Shared by the Vercel function (api/chat.ts) and the Vite dev middleware (vite.config.ts).

export const LIMITS = {
  /** History sent to the model: the newest messages only. */
  maxMessages: 20,
  maxChars: 1000,
  maxTokens: 500,
  /** Per IP, in memory (per server instance). */
  ratePerMinute: 10,
};

const LANGUAGES = { en: "English", tr: "Turkish", fa: "Persian (Farsi)" } as const;
type Lang = keyof typeof LANGUAGES;

/** The page titles exactly as the site shows them in each language (src/locales/*.json). */
const PAGE_NAMES: Record<Lang, string> = {
  en: "Me, Products, Vapes, Contact",
  tr: "Ben, Ürünler, Vape'ler, İletişim",
  fa: "من، محصولات، ویپ‌ها، تماس با ما",
};
/** "Joint" means a rolled cigarette here; the word to use for it in each language. */
const JOINT_WORD: Record<Lang, string> = { en: "joint", tr: "joint", fa: "جوینت (never مفصل)" };

const systemPrompt = (lang: Lang) => `You are "the cat" of a small personal website called JOINT: a tabby cat in a sunny field who greets visitors. You are friendly, warm and a little playful (an occasional cat-like touch is fine, but don't overdo it).

Always answer in ${LANGUAGES[lang]}, whatever language the visitor writes in.
Keep answers short: 2–5 sentences, unless the visitor asks for more detail. Plain text or light Markdown only.

About the site: the home page shows the cat with four joints fanning out of its head; each one opens a page. The pages are Me (about the site's owner, Mohammad Baharlou), Products (joints & cigarettes), Vapes, and Contact (how to get in touch). There is also a menu under the hamburger button at the top, a language switcher (English, Turkish, Persian) and a sound toggle.
In your answers, call the pages by the names the site shows in this language: ${PAGE_NAMES[lang]}. A "joint" here is a rolled cigarette; write it as: ${JOINT_WORD[lang]}. You can point visitors to these pages, but you don't know details beyond this, so don't invent prices, stock, addresses or other facts.

Stay on safe ground: no medical, legal or financial advice (suggest a professional instead). Never encourage anyone to use tobacco, cannabis or vaping products, and if someone seems to be a minor, kindly tell them these products are for adults only. Decline anything harmful or explicit, briefly and kindly.`;

const json = (status: number, error: string) => jsonBody(status, { error });
const limited = rateLimiter(LIMITS.ratePerMinute, 60_000);

function parseBody(body: unknown): { messages: ChatMessage[]; lang: Lang } | null {
  if (!body || typeof body !== "object") return null;
  const { messages, lang } = body as { messages?: unknown; lang?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const clean: ChatMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    if (content.length > LIMITS.maxChars) return null;
    if (content.trim()) clean.push({ role, content });
  }
  // The newest messages, starting with the visitor's.
  const recent = clean.slice(-LIMITS.maxMessages);
  while (recent.length && recent[0].role !== "user") recent.shift();
  if (!recent.length || recent[recent.length - 1].role !== "user") return null;
  return { messages: recent, lang: lang === "tr" || lang === "fa" ? lang : "en" };
}

export async function handleChat(request: Request, env: Record<string, string | undefined> = process.env): Promise<Response> {
  if (request.method !== "POST") return json(405, "forbidden");
  if (!sameOrigin(request)) return json(403, "forbidden");

  const provider = pickProvider(env);
  if (!provider) return json(503, "not_configured");
  if (limited(clientIp(request))) return json(429, "rate_limited");

  const input = parseBody(await request.json().catch(() => null));
  if (!input) return json(400, "bad_request");

  const iterator = provider
    .stream({ system: systemPrompt(input.lang), messages: input.messages, maxTokens: LIMITS.maxTokens, signal: request.signal })
    [Symbol.asyncIterator]();

  // Wait for the first piece, so a failure can still be answered with a proper status.
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (error) {
    console.error(`[chat] ${provider.name}:`, error instanceof Error ? error.message : error);
    return error instanceof ProviderError && error.kind === "rate_limited" ? json(429, "rate_limited") : json(502, "error");
  }

  const encoder = new TextEncoder();
  let pending: IteratorResult<string> | null = first;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = pending ?? (await iterator.next());
        pending = null;
        if (next.done) controller.close();
        else controller.enqueue(encoder.encode(next.value));
      } catch (error) {
        console.error(`[chat] ${provider.name} (mid-stream):`, error instanceof Error ? error.message : error);
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
