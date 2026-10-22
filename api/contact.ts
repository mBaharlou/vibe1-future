import { handleContact } from "./_lib/contact.js";

// Vercel function: POST /api/contact. RESEND_API_KEY / CONTACT_TO_EMAIL come from the project's
// environment variables and never reach the browser. Locally, vite.config.ts routes the same path.
export function POST(request: Request) {
  return handleContact(request);
}

export function GET() {
  return new Response(JSON.stringify({ error: "forbidden" }), { status: 405, headers: { "content-type": "application/json" } });
}
