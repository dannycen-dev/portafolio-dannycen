/**
 * Cloudflare Workers bindings for this Astro app.
 * Generate/refresh with: npm run cf:types
 */
interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  PUBLIC_SITE_URL: string;
  PUBLIC_GA_MEASUREMENT_ID?: string;
  BOOKING_TIMEZONE: string;
  BOOKING_SLOTS: string;
  BOOKING_DURATION_MIN: string;
  NOTIFY_TO_EMAIL: string;
  GOOGLE_CALENDAR_ID: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  GOOGLE_CALENDAR_WATCH_TOKEN?: string;
  SESSION?: KVNamespace;
}

declare namespace Cloudflare {
  interface Env {}
}
