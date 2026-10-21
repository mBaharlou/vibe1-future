import { httpError, sseData, type Provider } from "./types.js";

// Groq (free plan at console.groq.com), OpenAI-compatible chat completions. GROQ_MODEL overrides the default.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

type Chunk = { choices?: { delta?: { content?: string } }[] };

export function groqProvider(apiKey: string, model = DEFAULT_MODEL): Provider {
  return {
    name: `groq:${model}`,
    async *stream({ system, messages, maxTokens, signal }) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          stream: true,
          max_completion_tokens: maxTokens,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      if (!res.ok || !res.body) throw await httpError("groq", res);
      for await (const data of sseData(res.body)) {
        if (data === "[DONE]") return;
        const text = (JSON.parse(data) as Chunk).choices?.[0]?.delta?.content;
        if (text) yield text;
      }
    },
  };
}
