/**
 * Shared helpers for /api/* routes (D1 + CORS).
 */

export type ApiEnv = {
  DB: D1Database;
  PUBLIC_SITE_URL?: string;
  BOOKING_TIMEZONE?: string;
  BOOKING_SLOTS?: string;
  BOOKING_DURATION_MIN?: string;
  NOTIFY_TO_EMAIL?: string;
  GOOGLE_CALENDAR_ID?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
};

export function json(data: unknown, status = 200, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });
}

export function badRequest(message: string, details?: unknown) {
  return json({ ok: false, error: message, details }, 400);
}

export function serverError(message: string, details?: unknown) {
  return json({ ok: false, error: message, details }, 500);
}

export function corsHeaders(request: Request, siteUrl = "https://dannydev.space") {
  const origin = request.headers.get("Origin") || "";
  const allowed = new Set([
    siteUrl.replace(/\/$/, ""),
    "http://127.0.0.1:4329",
    "http://localhost:4329",
  ]);
  const allow = allowed.has(origin.replace(/\/$/, "")) ? origin : siteUrl.replace(/\/$/, "");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export function parseSlots(raw?: string): string[] {
  const fallback = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];
  if (!raw?.trim()) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
