import { getGoogleAccessToken, type GoogleAuthEnv } from "./auth";

export type GmailEnv = GoogleAuthEnv & {
  NOTIFY_TO_EMAIL?: string;
};

function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function sendGmailNotify(
  env: GmailEnv,
  opts: { subject: string; bodyText: string; replyToName?: string; replyToPhone?: string },
): Promise<{ id?: string }> {
  const token = await getGoogleAccessToken(env);
  const to = env.NOTIFY_TO_EMAIL;
  if (!to) throw new Error("NOTIFY_TO_EMAIL is not configured");

  const from = to;
  const lines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    opts.bodyText,
    "",
    opts.replyToName ? `Visitor: ${opts.replyToName}` : "",
    opts.replyToPhone ? `Phone/WhatsApp: ${opts.replyToPhone}` : "",
  ]
    .filter((l) => l !== undefined)
    .join("\r\n");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: toBase64Url(lines) }),
  });

  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message || `Gmail send failed (${res.status})`);
  }
  return { id: data.id };
}
