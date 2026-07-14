import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { corsHeaders, json, newId, readJson, type ApiEnv } from "../../lib/api";
import { hasGoogleCreds } from "../../lib/google/auth";
import { sendGmailNotify } from "../../lib/google/gmail";

export const prerender = false;

type MessageBody = {
  name?: string;
  phone?: string;
  message?: string;
  locale?: string;
  sourcePath?: string;
};

function getEnv(): ApiEnv {
  return env as unknown as ApiEnv;
}

export const OPTIONS: APIRoute = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request, getEnv().PUBLIC_SITE_URL) });

export const POST: APIRoute = async ({ request }) => {
  const headers = corsHeaders(request, getEnv().PUBLIC_SITE_URL);
  const e = getEnv();

  if (!e.DB) {
    return json({ ok: false, error: "D1 binding DB is not configured" }, 500, { headers });
  }

  const body = await readJson<MessageBody>(request);
  if (!body) return json({ ok: false, error: "Invalid JSON body" }, 400, { headers });

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();
  const locale = String(body.locale || "es").trim();
  const sourcePath = String(body.sourcePath || "").trim() || null;

  if (!name || !phone || !message) {
    return json({ ok: false, error: "name, phone and message are required" }, 400, { headers });
  }
  if (message.length > 5000) {
    return json({ ok: false, error: "message too long" }, 400, { headers });
  }

  const id = newId("msg");
  let gmailId: string | null = null;
  let warn: string | undefined;

  if (hasGoogleCreds(e)) {
    try {
      const sent = await sendGmailNotify(e, {
        subject: `Mensaje web · ${name}`,
        bodyText: [
          "Nuevo mensaje desde dannydev.space",
          "",
          `ID: ${id}`,
          `Nombre: ${name}`,
          `Teléfono / WhatsApp: ${phone}`,
          `Locale: ${locale}`,
          sourcePath ? `Path: ${sourcePath}` : "",
          "",
          "Mensaje:",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
        replyToName: name,
        replyToPhone: phone,
      });
      gmailId = sent.id || null;
    } catch (err) {
      warn = `Saved to D1; Gmail notify failed: ${err instanceof Error ? err.message : String(err)}`;
    }
  } else {
    warn = "Saved to D1 without Gmail sync (OAuth secrets missing)";
  }

  try {
    await e.DB.prepare(
      `INSERT INTO messages (id, name, phone, message, locale, source_path, status, gmail_message_id)
       VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`,
    )
      .bind(id, name, phone, message, locale, sourcePath, gmailId)
      .run();
  } catch (err) {
    return json(
      {
        ok: false,
        error: "Could not save message",
        details: err instanceof Error ? err.message : String(err),
      },
      500,
      { headers },
    );
  }

  return json({ ok: true, id, warning: warn }, 201, { headers });
};
