import Anthropic from "@anthropic-ai/sdk";
import { ProviderError, type Provider } from "./types.js";

// Claude Haiku 5.5: the cheapest current Claude model. Short chat replies, so thinking is off
// and effort is low (allowed on Haiku 5.5 at effort "high" or below).
const MODEL = "claude-haiku-5-5";

export function anthropicProvider(apiKey: string): Provider {
  const client = new Anthropic({ apiKey });
  return {
    name: `anthropic:${MODEL}`,
    async *stream({ system, messages, maxTokens, signal }) {
      try {
        const stream = client.messages.stream(
          {
            model: MODEL,
            max_tokens: maxTokens,
            system,
            messages,
            thinking: { type: "disabled" },
            output_config: { effort: "low" },
          },
          { signal },
        );
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) throw new ProviderError("rate_limited", error.message);
        if (error instanceof Anthropic.APIError) throw new ProviderError("error", `anthropic ${error.status}: ${error.message}`);
        throw error;
      }
    },
  };
}
