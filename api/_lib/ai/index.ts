import { anthropicProvider } from "./anthropic.js";
import { geminiProvider } from "./gemini.js";
import { groqProvider } from "./groq.js";
import type { Provider } from "./types.js";

export * from "./types.js";

/** The first provider with a key set wins: Anthropic → Gemini → Groq. Null when none is set up. */
export function pickProvider(env: Record<string, string | undefined> = process.env): Provider | null {
  if (env.ANTHROPIC_API_KEY) return anthropicProvider(env.ANTHROPIC_API_KEY);
  if (env.GEMINI_API_KEY) return geminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL || undefined);
  if (env.GROQ_API_KEY) return groqProvider(env.GROQ_API_KEY, env.GROQ_MODEL || undefined);
  return null;
}
