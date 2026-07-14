/**
 * Gmail send helper (HTML + plain text) via OAuth refresh token.
 * From address is always the authorized Gmail (dannycen.dev@gmail.com).
 *
 * MIME parts are base64-encoded so UTF-8 (Spanish) and HTML survive Gmail ingest.
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
  fromName?: string;
};

function utf8ToBinary(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return binary;
}

function toBase64(input: string) {
  return btoa(utf8ToBinary(input));
}

function toBase64Url(input: string) {
  return toBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Soft-wrap base64 at 76 chars (RFC 2045). */
function foldBase64(b64: string) {
  return b64.replace(/.{1,76}/g, (line) => `${line}\r\n`).trimEnd();
}

function encodeHeaderAtom(value: string) {
  if (/^[\x20-\x7E]*$/.test(value) && !/[\\"]/.test(value)) return value;
  return `=?UTF-8?B?${toBase64(value)}?=`;
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
  const boundary = `mixed_${crypto.randomUUID().replace(/-/g, "")}`;
  const messageId = `<${crypto.randomUUID()}@dannydev.space>`;
  const date = new Date().toUTCString().replace(/GMT$/, "+0000");
  const from = `${encodeHeaderAtom(opts.fromName)} <${opts.fromEmail}>`;

  const headers = [
    `From: ${from}`,
    `To: ${opts.to}`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : "",
    `Subject: ${encodeHeaderAtom(opts.subject)}`,
    `Message-ID: ${messageId}`,
    `Date: ${date}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
    .filter(Boolean)
    .join("\r\n");

  const textPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    foldBase64(toBase64(opts.text)),
  ].join("\r\n");

  const htmlPart = [
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    foldBase64(toBase64(opts.html)),
  ].join("\r\n");

  return `${headers}\r\n\r\n${textPart}\r\n${htmlPart}\r\n--${boundary}--\r\n`;
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
