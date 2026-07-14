/**
 * Google OAuth refresh → access token (Calendar + Gmail).
 * Uses fetch only — no googleapis SDK (Workers-friendly).
 */

export type GoogleAuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
};

export function hasGoogleCreds(env: GoogleAuthEnv) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);
}

export async function getGoogleAccessToken(env: GoogleAuthEnv): Promise<string> {
  if (!hasGoogleCreds(env)) {
    throw new Error("Missing Google OAuth secrets (CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN)");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      refresh_token: env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `Google token exchange failed (${res.status})`);
  }
  return data.access_token;
}
