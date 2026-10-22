import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Server-only variables for the AI chat and the contact form. No VITE_ prefix, so Vite never
// puts them in the bundle.
const SERVER_ENV = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GEMINI_MODEL", "GROQ_API_KEY", "GROQ_MODEL", "RESEND_API_KEY", "CONTACT_TO_EMAIL"];

type Handler = (request: Request, env: Record<string, string | undefined>) => Promise<Response>;

/** The serverless endpoints in api/, each with the module and export that handles it. */
const ROUTES: { path: string; module: string; load: (mod: Record<string, unknown>) => Handler }[] = [
  { path: "/api/chat", module: "/api/_lib/chat.ts", load: (m) => (m as typeof import("./api/_lib/chat")).handleChat },
  { path: "/api/contact", module: "/api/_lib/contact.ts", load: (m) => (m as typeof import("./api/_lib/contact")).handleContact },
];

/** `npm run dev`: the /api routes run the same handlers as the Vercel functions, with keys from .env.local. */
function apiDev(): Plugin {
  let env: Record<string, string | undefined> = {};
  return {
    name: "api-dev",
    apply: "serve",
    configResolved(config) {
      const loaded = loadEnv(config.mode, config.root, "");
      env = Object.fromEntries(SERVER_ENV.map((key) => [key, loaded[key] || process.env[key]]));
    },
    configureServer(server: ViteDevServer) {
      for (const route of ROUTES) {
        server.middlewares.use(route.path, (req: IncomingMessage, res: ServerResponse) => {
          void (async () => {
            const abort = new AbortController();
            res.on("close", () => abort.abort());
            const host = req.headers.host ?? "localhost";
            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (typeof value === "string") headers.set(key, value);
            }
            const hasBody = req.method !== "GET" && req.method !== "HEAD";
            const request = new Request(`http://${host}${route.path}`, {
              method: req.method,
              headers,
              body: hasBody ? (Readable.toWeb(req) as ReadableStream<Uint8Array>) : undefined,
              signal: abort.signal,
              // Required by Node's fetch for a streamed request body.
              ...(hasBody ? { duplex: "half" } : {}),
            } as RequestInit);
            try {
              const handle = route.load(await server.ssrLoadModule(route.module));
              const response = await handle(request, env);
              res.statusCode = response.status;
              response.headers.forEach((value, key) => res.setHeader(key, value));
              if (!response.body) return void res.end();
              Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).on("error", () => res.destroy()).pipe(res);
            } catch (error) {
              server.config.logger.error(`[${route.path}] ${error instanceof Error ? error.message : String(error)}`);
              if (!res.headersSent) res.statusCode = 500;
              res.end();
            }
          })();
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDev()],
});
