/**
 * Gmail send helper (HTML + plain text) via OAuth refresh token.
 * From address is always the authorized Gmail (dannycen.dev@gmail.com).
 */

import { getGoogleAccessToken, type GoogleAuthEnv } from "./auth";

export type GmailEnv = GoogleAuthEnv & {
  NOTIFY_TO_EMAIL?: string;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Display name in From header */
  fromName?: string;
};

function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeSubject(subject: string) {
  // RFC 2047 for non-ASCII subjects
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  const bytes = new TextEncoder().encode(subject);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function buildMime(opts: {
  fromEmail: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const boundary = `b_${crypto.randomUUID().replace(/-/g, "")}`;
  const from = `${opts.fromName} <${opts.fromEmail}>`;
  const headers = [
    `From: ${from}`,
    `To: ${opts.to}`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : "",
    `Subject: ${encodeSubject(opts.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
    .filter(Boolean)
    .join("\r\n");

  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    opts.text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    opts.html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return `${headers}\r\n\r\n${body}`;
}

export async function sendEmail(env: GmailEnv, input: SendEmailInput): Promise<{ id?: string }> {
  const token = await getGoogleAccessToken(env);
  const fromEmail = env.NOTIFY_TO_EMAIL || "dannycen.dev@gmail.com";
  const raw = buildMime({
    fromEmail,
    fromName: input.fromName || "Danny Cen",
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: toBase64Url(raw) }),
  });

  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message || `Gmail send failed (${res.status})`);
  }
  return { id: data.id };
}

/** @deprecated Prefer sendEmail — kept for any older callers */
export async function sendGmailNotify(
  env: GmailEnv,
  opts: { subject: string; bodyText: string; replyToName?: string; replyToPhone?: string },
): Promise<{ id?: string }> {
  const to = env.NOTIFY_TO_EMAIL;
  if (!to) throw new Error("NOTIFY_TO_EMAIL is not configured");
  return sendEmail(env, {
    to,
    subject: opts.subject,
    text: [
      opts.bodyText,
      opts.replyToName ? `Visitor: ${opts.replyToName}` : "",
      opts.replyToPhone ? `Phone/WhatsApp: ${opts.replyToPhone}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${opts.bodyText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
  });
}
