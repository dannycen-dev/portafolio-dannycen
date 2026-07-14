import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { corsHeaders, isValidEmail, json, newId, readJson, type ApiEnv } from "../../lib/api";
import { messageOwnerEmail, messageVisitorEmail } from "../../lib/email/templates";
import { hasGoogleCreds } from "../../lib/google/auth";
import { sendEmail } from "../../lib/google/gmail";

export const prerender = false;

type MessageBody = {
  name?: string;
  email?: string;
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
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();
  const locale = String(body.locale || "es").trim();
  const sourcePath = String(body.sourcePath || "").trim() || null;

  if (!name || !email || !phone || !message) {
    return json({ ok: false, error: "name, email, phone and message are required" }, 400, {
      headers,
    });
  }
  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Invalid email" }, 400, { headers });
  }
  if (message.length > 5000) {
    return json({ ok: false, error: "message too long" }, 400, { headers });
  }

  const id = newId("msg");
  let gmailId: string | null = null;
  let warn: string | undefined;
  const ownerTo = e.NOTIFY_TO_EMAIL || "dannycen.dev@gmail.com";

  if (hasGoogleCreds(e)) {
    try {
      const visitor = messageVisitorEmail({ locale, name, message, email });
      const owner = messageOwnerEmail({
        name,
        email,
        phone,
        message,
        messageId: id,
        sourcePath,
      });

      const sentVisitor = await sendEmail(e, {
        to: email,
        subject: locale.startsWith("en")
          ? "I got your message | Danny Cen"
          : "Recibi tu mensaje | Danny Cen",
        html: visitor.html,
        text: visitor.text,
        replyTo: ownerTo,
      });
      const sentOwner = await sendEmail(e, {
        to: ownerTo,
        subject: `${name} quiere que lo contactes | dannydev.space`,
        html: owner.html,
        text: owner.text,
        replyTo: email,
      });
      gmailId = sentVisitor.id || sentOwner.id || null;
    } catch (err) {
      warn = `Saved to D1; Gmail failed: ${err instanceof Error ? err.message : String(err)}`;
    }
  } else {
    warn = "Saved to D1 without Gmail sync (OAuth secrets missing)";
  }

  try {
    await e.DB.prepare(
      `INSERT INTO messages (id, name, email, phone, message, locale, source_path, status, gmail_message_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
    )
      .bind(id, name, email, phone, message, locale, sourcePath, gmailId)
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/no such column: email/i.test(msg)) {
      await e.DB.prepare(
        `INSERT INTO messages (id, name, phone, message, locale, source_path, status, gmail_message_id)
         VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
        .bind(id, name, phone, message, locale, sourcePath, gmailId)
        .run();
    } else {
      return json(
        {
          ok: false,
          error: "Could not save message",
          details: msg,
        },
        500,
        { headers },
      );
    }
  }

  return json({ ok: true, id, warning: warn }, 201, { headers });
};
