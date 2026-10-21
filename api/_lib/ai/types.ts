// One small interface in front of every AI provider, so switching is one env change.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type StreamOptions = {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  signal: AbortSignal;
};

export type Provider = {
  /** Shown in server logs only. */
  name: string;
  /** Yields the reply's text as it arrives. */
  stream: (options: StreamOptions) => AsyncIterable<string>;
};

/** "rate_limited" when the provider itself throttles us; everything else is "error". */
export class ProviderError extends Error {
  constructor(
    readonly kind: "rate_limited" | "error",
    message: string,
  ) {
    super(message);
  }
}

/** Reads a text/event-stream body and yields each event's `data:` payload. */
export async function* sseData(body: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let end: number;
    while ((end = buffer.search(/\r?\n\r?\n/)) >= 0) {
      const event = buffer.slice(0, end);
      buffer = buffer.slice(end).replace(/^\r?\n\r?\n/, "");
      const data = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (data) yield data;
    }
  }
}

/** Maps a failed HTTP response from a REST provider to a ProviderError. */
export async function httpError(provider: string, res: Response) {
  const detail = await res.text().catch(() => "");
  return new ProviderError(res.status === 429 ? "rate_limited" : "error", `${provider} ${res.status}: ${detail.slice(0, 300)}`);
}
