import { defineMiddleware } from "astro:middleware";
import { dataSyncReady } from "./lib/data-sync";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}, 5 * 60_000);

function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ??
    "unknown"
  );
}

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false, retryAfter: 0 };
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "img-src 'self' cdn.jsdelivr.net data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' static.cloudflareinsights.com",
    "connect-src 'self' cloudflareinsights.com",
    "frame-ancestors 'none'",
  ].join("; "),
};

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  const isApiRoute = url.pathname.startsWith("/api/");

  if (request.method === "OPTIONS" && isApiRoute) {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  if (isApiRoute) {
    // Blocks only the very first request(s) until the initial clone/pull
    // resolves; already-resolved afterwards, so this is a no-op await.
    await dataSyncReady;

    const ip = getClientIp(request);
    const { limited, retryAfter } = isRateLimited(ip);

    if (limited) {
      return new Response(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          ...CORS_HEADERS,
        },
      });
    }
  }

  const response = await next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (isApiRoute) {
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value);
    }
  }

  return response;
});
