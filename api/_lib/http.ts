// Small helpers shared by the serverless endpoints (api/chat.ts, api/contact.ts).

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";

/** Only the site's own pages may call these: the Origin must match the host it was sent to. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** A sliding-window limit per key (IP), in memory (per server instance). Returns true when over. */
export function rateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    const over = recent.length >= limit;
    if (!over) recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) for (const [k, times] of hits) if (!times.some((t) => now - t < windowMs)) hits.delete(k);
    return over;
  };
}
