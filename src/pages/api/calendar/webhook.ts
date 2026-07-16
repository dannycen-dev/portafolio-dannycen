import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { corsHeaders, json, type ApiEnv } from "../../../lib/api";
import { handleCalendarWebhook } from "../../../lib/google/calendar-watch";

export const prerender = false;

function getEnv(): ApiEnv {
  return env as unknown as ApiEnv;
}

export const POST: APIRoute = async ({ request }) => {
  const e = getEnv();
  return handleCalendarWebhook(request, e);
};

export const GET: APIRoute = async ({ request }) => {
  const headers = corsHeaders(request, getEnv().PUBLIC_SITE_URL);
  return json({ ok: true, message: "Google Calendar webhook endpoint" }, 200, { headers });
};
