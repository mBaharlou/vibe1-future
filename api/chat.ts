import { handleChat } from "./_lib/chat.js";

// Vercel function: POST /api/chat. Keys come from the project's environment variables and never
// reach the browser. Locally, vite.config.ts routes the same path to the same handler.
export function POST(request: Request) {
  return handleChat(request);
}

export function GET() {
  return new Response(JSON.stringify({ error: "forbidden" }), { status: 405, headers: { "content-type": "application/json" } });
}
