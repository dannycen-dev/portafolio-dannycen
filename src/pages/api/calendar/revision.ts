import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { corsHeaders, json, type ApiEnv } from "../../../lib/api";
import {
  ensureCalendarWatch,
  getCalendarRevision,
} from "../../../lib/google/calendar-watch";
import { hasGoogleCreds } from "../../../lib/google/auth";

export const prerender = false;

function getEnv(): ApiEnv {
  return env as unknown as ApiEnv;
}

export const GET: APIRoute = async ({ request }) => {
  const headers = corsHeaders(request, getEnv().PUBLIC_SITE_URL);
  const e = getEnv();

  if (!e.DB) {
    return json({ ok: false, error: "D1 binding DB is not configured" }, 500, { headers });
  }

  if (hasGoogleCreds(e)) {
    void ensureCalendarWatch(e);
  }

  const revision = await getCalendarRevision(e.DB);
  return json(
    {
      ok: true,
      revision,
      watch: hasGoogleCreds(e),
    },
    200,
    {
      headers: {
        ...headers,
        "Cache-Control": "no-store",
      },
    },
  );
};
