import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { corsHeaders, json, type ApiEnv } from "../../lib/api";
import { hasGoogleCreds } from "../../lib/google/auth";

export const prerender = false;

function getEnv(): ApiEnv {
  return env as unknown as ApiEnv;
}

export const GET: APIRoute = async ({ request }) => {
  const e = getEnv();
  const headers = corsHeaders(request, e.PUBLIC_SITE_URL);
  return json(
    {
      ok: true,
      site: e.PUBLIC_SITE_URL || "https://dannydev.space",
      db: Boolean(e.DB),
      google: hasGoogleCreds(e),
    },
    200,
    { headers },
  );
};
