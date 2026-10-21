import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Server-only variables for the AI chat. No VITE_ prefix, so Vite never puts them in the bundle.
const AI_ENV = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GEMINI_MODEL", "GROQ_API_KEY", "GROQ_MODEL"];

/** `npm run dev`: POST /api/chat runs the same handler as the Vercel function, with keys from .env.local. */
function apiChatDev(): Plugin {
  let env: Record<string, string | undefined> = {};
  return {
    name: "api-chat-dev",
    apply: "serve",
    configResolved(config) {
      const loaded = loadEnv(config.mode, config.root, "");
      env = Object.fromEntries(AI_ENV.map((key) => [key, loaded[key] || process.env[key]]));
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/chat", (req: IncomingMessage, res: ServerResponse) => {
        void (async () => {
          const abort = new AbortController();
          res.on("close", () => abort.abort());
          const host = req.headers.host ?? "localhost";
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === "string") headers.set(key, value);
          }
          const hasBody = req.method !== "GET" && req.method !== "HEAD";
          const request = new Request(`http://${host}/api/chat`, {
            method: req.method,
            headers,
            body: hasBody ? (Readable.toWeb(req) as ReadableStream<Uint8Array>) : undefined,
            signal: abort.signal,
            // Required by Node's fetch for a streamed request body.
            ...(hasBody ? { duplex: "half" } : {}),
          } as RequestInit);
          try {
            const { handleChat } = (await server.ssrLoadModule("/api/_lib/chat.ts")) as typeof import("./api/_lib/chat");
            const response = await handleChat(request, env);
            res.statusCode = response.status;
            response.headers.forEach((value, key) => res.setHeader(key, value));
            if (!response.body) return void res.end();
            Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).on("error", () => res.destroy()).pipe(res);
          } catch (error) {
            server.config.logger.error(`[api/chat] ${error instanceof Error ? error.message : String(error)}`);
            if (!res.headersSent) res.statusCode = 500;
            res.end();
          }
        })();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiChatDev()],
});
