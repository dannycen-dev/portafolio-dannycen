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

function isAllowedOrigin(origin: string, siteUrl: string): boolean {
  const o = origin.replace(/\/$/, "");
  if (!o) return false;
  if (
    o === siteUrl.replace(/\/$/, "") ||
    o === "http://127.0.0.1:4329" ||
    o === "http://localhost:4329"
  ) {
    return true;
  }
  try {
    const { hostname } = new URL(o);
    return (
      hostname.endsWith(".workers.dev") ||
      hostname === "portafolio-dannycen.pages.dev" ||
      hostname.endsWith(".portafolio-dannycen.pages.dev")
    );
  } catch {
    return false;
  }
}

export function corsHeaders(request: Request, siteUrl = "https://dannydev.space") {
  const origin = request.headers.get("Origin") || "";
  const allow = isAllowedOrigin(origin, siteUrl)
    ? origin.replace(/\/$/, "")
    : siteUrl.replace(/\/$/, "");
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

/** Lightweight email check for lead forms (not full RFC). */
export function isValidEmail(raw: string) {
  const email = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function formatBookingLabels(date: string, slot: string, locale: string) {
  const when = new Date(`${date}T${slot}:00-06:00`);
  const loc = locale.startsWith("en") ? "en-US" : "es-MX";
  const dateLabel = new Intl.DateTimeFormat(loc, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Merida",
  }).format(when);
  const timeLabel = new Intl.DateTimeFormat(loc, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Merida",
  }).format(when);
  return { dateLabel, timeLabel };
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
