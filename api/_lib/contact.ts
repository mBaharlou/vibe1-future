import { Resend } from "resend";
import { clientIp, json, rateLimiter, sameOrigin } from "./http.js";

// POST /api/contact: { name, email, message, company (honeypot), page?, lang? } → sends the
// message to CONTACT_TO_EMAIL with Resend, reply-to the visitor.
// Answers JSON: { ok: true } · { error }: not_configured 503 · rate_limited 429 · invalid 400 ·
// forbidden 403/405 · error 502.
// Shared by the Vercel function (api/contact.ts) and the Vite dev middleware (vite.config.ts).

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 2000,
  /** Per IP, in memory (per server instance). */
  perWindow: 3,
  windowMs: 10 * 60_000,
};

const DEFAULT_TO = "mmdbaharlou@gmail.com";
// Resend's test sender: works without a domain while the Resend account uses the recipient's address.
const FROM = "Site Contact <onboarding@resend.dev>";
const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

const limited = rateLimiter(CONTACT_LIMITS.perWindow, CONTACT_LIMITS.windowMs);

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Header-safe: no line breaks in the subject. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

type Fields = { name: string; email: string; message: string; page: string; lang: string };

function parse(body: unknown): Fields | "bot" | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  // Honeypot: a hidden field only bots fill in.
  if (typeof b.company === "string" && b.company.trim()) return "bot";
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(b.name);
  const email = str(b.email);
  const message = str(b.message);
  if (!name || name.length > CONTACT_LIMITS.name) return null;
  if (!email || email.length > CONTACT_LIMITS.email || !EMAIL.test(email)) return null;
  if (!message || message.length > CONTACT_LIMITS.message) return null;
  return { name, email, message, page: str(b.page).slice(0, 200) || "/", lang: str(b.lang).slice(0, 5) || "en" };
}

export async function handleContact(request: Request, env: Record<string, string | undefined> = process.env): Promise<Response> {
  if (request.method !== "POST") return json(405, { error: "forbidden" });
  if (!sameOrigin(request)) return json(403, { error: "forbidden" });

  const fields = parse(await request.json().catch(() => null));
  if (fields === "bot") return json(200, { ok: true });
  if (!fields) return json(400, { error: "invalid" });
  if (!env.RESEND_API_KEY) return json(503, { error: "not_configured" });
  if (limited(clientIp(request))) return json(429, { error: "rate_limited" });

  const { name, email, message, page, lang } = fields;
  const text = `New message from the site\n\nName: ${name}\nEmail: ${email}\nPage: ${page}\nLanguage: ${lang}\n\n${message}\n`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#1f1f1f">
<p style="margin:0 0 12px"><strong>New message from the site</strong></p>
<table style="border-collapse:collapse;margin:0 0 16px">
<tr><td style="padding:2px 12px 2px 0;color:#666">Name</td><td>${escapeHtml(name)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#666">Email</td><td>${escapeHtml(email)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#666">Page</td><td>${escapeHtml(page)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#666">Language</td><td>${escapeHtml(lang)}</td></tr>
</table>
<div style="white-space:pre-wrap;border-left:3px solid #4ba347;padding-left:12px">${escapeHtml(message)}</div>
</div>`;

  try {
    const { error } = await new Resend(env.RESEND_API_KEY).emails.send({
      from: FROM,
      to: env.CONTACT_TO_EMAIL || DEFAULT_TO,
      replyTo: email,
      subject: oneLine(`New message from ${name} via the site`).slice(0, 200),
      text,
      html,
    });
    if (error) {
      console.error("[contact] resend:", error.name, error.message);
      return json(502, { error: "error" });
    }
    return json(200, { ok: true });
  } catch (error) {
    console.error("[contact]", error instanceof Error ? error.message : error);
    return json(502, { error: "error" });
  }
}
