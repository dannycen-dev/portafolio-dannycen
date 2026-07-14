import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  badRequest,
  corsHeaders,
  json,
  newId,
  parseSlots,
  readJson,
  type ApiEnv,
} from "../../lib/api";
import { hasGoogleCreds } from "../../lib/google/auth";
import { createCalendarEvent } from "../../lib/google/calendar";
import { sendGmailNotify } from "../../lib/google/gmail";

export const prerender = false;

type BookingBody = {
  name?: string;
  phone?: string;
  date?: string;
  slot?: string;
  locale?: string;
};

function getEnv(): ApiEnv {
  return env as unknown as ApiEnv;
}

export const OPTIONS: APIRoute = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request, getEnv().PUBLIC_SITE_URL) });

export const GET: APIRoute = async ({ request, url }) => {
  const headers = corsHeaders(request, getEnv().PUBLIC_SITE_URL);
  const e = getEnv();

  if (!e.DB) {
    return json({ ok: false, error: "D1 binding DB is not configured" }, 500, { headers });
  }

  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return badRequest("Query ?date=YYYY-MM-DD is required");
  }

  const allSlots = parseSlots(e.BOOKING_SLOTS);
  const booked = await e.DB.prepare(
    `SELECT slot FROM bookings WHERE date = ? AND status != 'cancelled'`,
  )
    .bind(date)
    .all<{ slot: string }>();

  const taken = new Set((booked.results || []).map((r) => r.slot));
  const available = allSlots.filter((s) => !taken.has(s));

  return json(
    {
      ok: true,
      date,
      timezone: e.BOOKING_TIMEZONE || "America/Merida",
      slots: allSlots,
      available,
      booked: [...taken],
    },
    200,
    { headers },
  );
};

export const POST: APIRoute = async ({ request }) => {
  const headers = corsHeaders(request, getEnv().PUBLIC_SITE_URL);
  const e = getEnv();

  if (!e.DB) {
    return json({ ok: false, error: "D1 binding DB is not configured" }, 500, { headers });
  }

  const body = await readJson<BookingBody>(request);
  if (!body) return json({ ok: false, error: "Invalid JSON body" }, 400, { headers });

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const date = String(body.date || "").trim();
  const slot = String(body.slot || "").trim();
  const locale = String(body.locale || "es").trim();

  if (!name || !phone || !date || !slot) {
    return json({ ok: false, error: "name, phone, date and slot are required" }, 400, { headers });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(slot)) {
    return json({ ok: false, error: "Invalid date or slot format" }, 400, { headers });
  }

  const allowed = parseSlots(e.BOOKING_SLOTS);
  if (!allowed.includes(slot)) {
    return json({ ok: false, error: "Slot is not offered" }, 400, { headers });
  }

  const existing = await e.DB.prepare(
    `SELECT id FROM bookings WHERE date = ? AND slot = ? AND status != 'cancelled' LIMIT 1`,
  )
    .bind(date, slot)
    .first();

  if (existing) {
    return json({ ok: false, error: "Slot already booked" }, 409, { headers });
  }

  const id = newId("bk");
  const timezone = e.BOOKING_TIMEZONE || "America/Merida";
  let googleEventId: string | null = null;
  let meetLink: string | null = null;
  let warn: string | undefined;

  if (hasGoogleCreds(e)) {
    try {
      const event = await createCalendarEvent(e, {
        summary: `Cita · ${name}`,
        description: [
          `Reserva desde dannydev.space`,
          `Nombre: ${name}`,
          `Teléfono / WhatsApp: ${phone}`,
          `Fecha: ${date}`,
          `Hora: ${slot} (${timezone})`,
          `Locale: ${locale}`,
          `Booking ID: ${id}`,
        ].join("\n"),
        date,
        slot,
      });
      googleEventId = event.eventId;
      meetLink = event.meetLink || null;

      try {
        await sendGmailNotify(e, {
          subject: `Nueva cita · ${date} ${slot} · ${name}`,
          bodyText: [
            "Nueva cita agendada en dannydev.space",
            "",
            `ID: ${id}`,
            `Nombre: ${name}`,
            `Teléfono: ${phone}`,
            `Fecha: ${date}`,
            `Hora: ${slot} (${timezone})`,
            meetLink ? `Meet: ${meetLink}` : "",
            googleEventId ? `Calendar event: ${googleEventId}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          replyToName: name,
          replyToPhone: phone,
        });
      } catch (err) {
        warn = `Calendar OK; Gmail notify failed: ${err instanceof Error ? err.message : String(err)}`;
      }
    } catch (err) {
      warn = `Saved locally; Google sync deferred: ${err instanceof Error ? err.message : String(err)}`;
    }
  } else {
    warn = "Saved to D1 without Google sync (OAuth secrets missing)";
  }

  try {
    await e.DB.prepare(
      `INSERT INTO bookings (id, name, phone, date, slot, timezone, locale, status, google_event_id, meet_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
    )
      .bind(id, name, phone, date, slot, timezone, locale, googleEventId, meetLink)
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/UNIQUE/i.test(msg)) {
      return json({ ok: false, error: "Slot already booked" }, 409, { headers });
    }
    return json({ ok: false, error: "Could not save booking", details: msg }, 500, { headers });
  }

  return json(
    {
      ok: true,
      id,
      date,
      slot,
      meetLink,
      googleEventId,
      warning: warn,
    },
    201,
    { headers },
  );
};
