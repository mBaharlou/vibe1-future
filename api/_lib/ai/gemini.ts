import { httpError, sseData, type Provider } from "./types.js";

// Google Gemini (free tier in Google AI Studio). GEMINI_MODEL overrides the default.
// Flash-Lite: fast and on the free tier (3.8 Flash is often overloaded there).
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
// Gemini counts thinking tokens against maxOutputTokens, so the reply gets this much headroom
// on top of maxTokens (thinking is kept at "low").
const THINKING_HEADROOM = 1000;

type Chunk = { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };

export function geminiProvider(apiKey: string, model = DEFAULT_MODEL): Provider {
  return {
    name: `gemini:${model}`,
    async *stream({ system, messages, maxTokens, signal }) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
        {
          method: "POST",
          signal,
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
            generationConfig: { maxOutputTokens: maxTokens + THINKING_HEADROOM, thinkingConfig: { thinkingLevel: "low" } },
          }),
        },
      );
      if (!res.ok || !res.body) throw await httpError("gemini", res);
      for await (const data of sseData(res.body)) {
        const chunk = JSON.parse(data) as Chunk;
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          if (part.text && !part.thought) yield part.text;
        }
      }
    },
  };
}
