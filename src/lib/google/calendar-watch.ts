import { getGoogleAccessToken, hasGoogleCreds } from "./auth";
import type { CalendarEnv } from "./calendar";

export type CalendarWatchEnv = CalendarEnv & {
  DB: D1Database;
  PUBLIC_SITE_URL?: string;
  GOOGLE_CALENDAR_WATCH_TOKEN?: string;
};

export type WatchChannelState = {
  channelId: string;
  resourceId: string;
  expiration: number;
};

const WATCH_KEY = "watch";
const REVISION_KEY = "revision";
const RENEW_BEFORE_MS = 24 * 60 * 60 * 1000;
const WATCH_TTL_MS = 6 * 24 * 60 * 60 * 1000;

function webhookUrl(env: CalendarWatchEnv) {
  const base = (env.PUBLIC_SITE_URL || "https://dannydev.space").replace(/\/$/, "");
  return `${base}/api/calendar/webhook/`;
}

export async function getCalendarRevision(db: D1Database): Promise<number> {
  const row = await db
    .prepare(`SELECT value FROM calendar_sync WHERE key = ?`)
    .bind(REVISION_KEY)
    .first<{ value: string }>();
  return row?.value ? Number(row.value) || 0 : 0;
}

export async function bumpCalendarRevision(db: D1Database): Promise<number> {
  const next = (await getCalendarRevision(db)) + 1;
  await db
    .prepare(
      `INSERT INTO calendar_sync (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
    )
    .bind(REVISION_KEY, String(next))
    .run();
  return next;
}

async function getWatchState(db: D1Database): Promise<WatchChannelState | null> {
  const row = await db
    .prepare(`SELECT value FROM calendar_sync WHERE key = ?`)
    .bind(WATCH_KEY)
    .first<{ value: string }>();
  if (!row?.value) return null;
  try {
    return JSON.parse(row.value) as WatchChannelState;
  } catch {
    return null;
  }
}

async function setWatchState(db: D1Database, state: WatchChannelState | null) {
  if (!state) {
    await db.prepare(`DELETE FROM calendar_sync WHERE key = ?`).bind(WATCH_KEY).run();
    return;
  }
  await db
    .prepare(
      `INSERT INTO calendar_sync (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
    )
    .bind(WATCH_KEY, JSON.stringify(state))
    .run();
}

async function stopWatchChannel(
  env: CalendarWatchEnv,
  state: WatchChannelState,
): Promise<void> {
  if (!hasGoogleCreds(env)) return;
  const token = await getGoogleAccessToken(env);
  await fetch("https://www.googleapis.com/calendar/v3/channels/stop", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: state.channelId,
      resourceId: state.resourceId,
    }),
  });
}

async function registerWatchChannel(env: CalendarWatchEnv): Promise<WatchChannelState> {
  const token = await getGoogleAccessToken(env);
  const calendarId = encodeURIComponent(env.GOOGLE_CALENDAR_ID || "primary");
  const channelId = crypto.randomUUID();
  const expiration = Date.now() + WATCH_TTL_MS;
  const body: Record<string, string> = {
    id: channelId,
    type: "web_hook",
    address: webhookUrl(env),
    expiration: String(expiration),
  };
  const watchToken = env.GOOGLE_CALENDAR_WATCH_TOKEN?.trim();
  if (watchToken) body.token = watchToken;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await res.json()) as {
    id?: string;
    resourceId?: string;
    expiration?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.id || !data.resourceId) {
    throw new Error(data.error?.message || `Calendar watch failed (${res.status})`);
  }

  return {
    channelId: data.id,
    resourceId: data.resourceId,
    expiration: Number(data.expiration) || expiration,
  };
}

/** Register or renew the Google Calendar push channel (Cron + lazy init). */
export async function ensureCalendarWatch(env: CalendarWatchEnv): Promise<"ok" | "skipped" | "error"> {
  if (!hasGoogleCreds(env) || !env.DB) return "skipped";

  try {
    const current = await getWatchState(env.DB);
    if (current && current.expiration > Date.now() + RENEW_BEFORE_MS) {
      return "ok";
    }

    if (current) {
      try {
        await stopWatchChannel(env, current);
      } catch {
        /* channel may already be expired */
      }
    }

    const next = await registerWatchChannel(env);
    await setWatchState(env.DB, next);
    return "ok";
  } catch {
    return "error";
  }
}

export function isValidWatchRequest(
  request: Request,
  env: Pick<CalendarWatchEnv, "GOOGLE_CALENDAR_WATCH_TOKEN">,
): boolean {
  const expected = env.GOOGLE_CALENDAR_WATCH_TOKEN?.trim();
  if (!expected) return true;
  return request.headers.get("X-Goog-Channel-Token") === expected;
}

export async function handleCalendarWebhook(
  request: Request,
  env: CalendarWatchEnv,
): Promise<Response> {
  if (!isValidWatchRequest(request, env)) {
    return new Response("Forbidden", { status: 403 });
  }

  const state = request.headers.get("X-Goog-Resource-State") || "";
  if (state === "exists" && env.DB) {
    await bumpCalendarRevision(env.DB);
  }

  return new Response(null, { status: 200 });
}
