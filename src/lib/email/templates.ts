/**
 * Branded transactional emails — voice + visual language of dannydev.space.
 * Direct, clear, less friction. No corporate “lead funnel” tone.
 */

import { site } from "../../data/site";

export type BrandEmailCopy = {
  lang?: "es" | "en";
  eyebrow: string;
  title: string;
  greeting: string;
  intro: string;
  detailsTitle: string;
  rows: { label: string; value: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  footerNote: string;
};

const ACCENT = "#155f58";
const ACCENT_DEEP = "#0b3d39";
const BG = "#eef1ef";
const INK = "#101412";
const MUTED = "#4d5650";
const SURFACE = "#ffffff";
const SITE = "https://dannydev.space";
const TAGLINE_ES = "Ingeniero en Software · Automatización con IA · RevOps";
const TAGLINE_EN = "Software Engineer · AI automation · RevOps";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return `https://wa.me/52${site.phone.replace(/\D/g, "").slice(-10)}`;
  return `https://wa.me/${digits}`;
}

function mailtoHref(email: string, subject: string, body?: string) {
  const q = new URLSearchParams({ subject });
  if (body) q.set("body", body);
  return `mailto:${email}?${q.toString()}`;
}

function ctaBlock(
  label: string | undefined,
  href: string | undefined,
  variant: "primary" | "ghost" = "primary",
) {
  if (!label || !href) return "";
  const bg = variant === "primary" ? ACCENT : SURFACE;
  const color = variant === "primary" ? "#ffffff" : ACCENT_DEEP;
  const border = variant === "primary" ? ACCENT : ACCENT;
  return `
    <tr>
      <td style="padding:${variant === "primary" ? "28px" : "10px"} 0 8px;">
        <a href="${esc(href)}" style="display:inline-block;background:${bg};color:${color};border:2px solid ${border};text-decoration:none;font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.02em;padding:14px 22px;">${esc(label)}</a>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 4px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};word-break:break-all;">
        ${esc(href)}
      </td>
    </tr>`;
}

export function renderBrandEmail(copy: BrandEmailCopy): { html: string; text: string } {
  const en = copy.lang === "en";
  const tagline = en ? TAGLINE_EN : TAGLINE_ES;
  const rowsHtml = copy.rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(16,20,18,0.12);font-family:Figtree,Helvetica,Arial,sans-serif;font-size:13px;color:${MUTED};width:38%;vertical-align:top;">${esc(r.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(16,20,18,0.12);font-family:Figtree,Helvetica,Arial,sans-serif;font-size:15px;color:${INK};font-weight:600;vertical-align:top;white-space:pre-wrap;">${esc(r.value)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${en ? "en" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${esc(copy.title)}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(copy.intro)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding:0 0 18px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;height:40px;background:${ACCENT_DEEP};color:#ffffff;font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;text-align:center;line-height:40px;">DC</td>
                  <td style="padding-left:12px;">
                    <div style="font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${ACCENT_DEEP};line-height:1.2;">Danny Cen</div>
                    <div style="font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};padding-top:2px;">${esc(tagline)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${SURFACE};padding:28px 24px;border-top:3px solid ${ACCENT};">
              <p style="margin:0 0 8px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};font-weight:700;">${esc(copy.eyebrow)}</p>
              <h1 style="margin:0 0 16px;font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:26px;line-height:1.2;color:${ACCENT_DEEP};font-weight:800;">${esc(copy.title)}</h1>
              <p style="margin:0 0 10px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:16px;color:${INK};">${esc(copy.greeting)}</p>
              <p style="margin:0 0 22px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${MUTED};">${esc(copy.intro)}</p>
              <p style="margin:0 0 8px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${ACCENT};font-weight:700;">${esc(copy.detailsTitle)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
              ${ctaBlock(copy.ctaLabel, copy.ctaHref, "primary")}
              ${ctaBlock(copy.ctaSecondaryLabel, copy.ctaSecondaryHref, "ghost")}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 0;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:${MUTED};">
              ${esc(copy.footerNote)}<br />
              <a href="${SITE}" style="color:${ACCENT};text-decoration:none;">dannydev.space</a>
              · Mérida, Yucatán, México
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Danny Cen",
    tagline,
    "",
    copy.eyebrow,
    copy.title,
    "",
    copy.greeting,
    copy.intro,
    "",
    copy.detailsTitle,
    ...copy.rows.map((r) => `${r.label}: ${r.value}`),
    copy.ctaHref ? `\n${copy.ctaLabel}: ${copy.ctaHref}` : "",
    copy.ctaSecondaryHref ? `${copy.ctaSecondaryLabel}: ${copy.ctaSecondaryHref}` : "",
    "",
    copy.footerNote,
    SITE,
  ]
    .filter((l) => l !== undefined && l !== "")
    .join("\n");

  return { html, text };
}

/** Confirmation to the person who booked — Meet CTA. */
export function bookingVisitorEmail(opts: {
  locale: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
  phone: string;
  meetLink?: string | null;
  calendarLink?: string | null;
}) {
  const en = opts.locale.startsWith("en");
  const tz = opts.timezone === "America/Merida" ? (en ? "CST (Mérida, Yucatán)" : "CST (Mérida, Yucatán)") : opts.timezone;
  return renderBrandEmail({
    lang: en ? "en" : "es",
    eyebrow: en ? "Your call is confirmed" : "Tu cita está confirmada",
    title: en ? "Thanks for booking time with me" : "Gracias por agendar conmigo",
    greeting: en ? `Hi ${opts.name},` : `Hola ${opts.name},`,
    intro: en
      ? "Thank you for scheduling a consult on dannydev.space — I really appreciate it. I’m looking forward to hearing about your project and seeing how I can help with automation, systems, or RevOps. You’ll also receive a Google Calendar invite from my email."
      : "Gracias por agendar una consulta en dannydev.space — de verdad lo aprecio. Tengo ganas de escucharte y ver cómo puedo ayudarte con automatización, sistemas o RevOps. También te llegará la invitación de Google Calendar desde mi correo.",
    detailsTitle: en ? "Your appointment" : "Detalle de tu cita",
    rows: [
      { label: en ? "Date" : "Fecha", value: opts.dateLabel },
      { label: en ? "Time" : "Hora", value: `${opts.timeLabel} (${tz})` },
      { label: en ? "Duration" : "Duración", value: "30 min" },
      { label: en ? "Via" : "Vía", value: "Google Meet" },
    ],
    ctaLabel: opts.meetLink ? (en ? "Join the call" : "Entrar a la videollamada") : undefined,
    ctaHref: opts.meetLink || undefined,
    ctaSecondaryLabel: opts.calendarLink
      ? en
        ? "Open in Google Calendar"
        : "Abrir en Google Calendar"
      : undefined,
    ctaSecondaryHref: opts.calendarLink || undefined,
    footerNote: en
      ? `Need to reschedule? Just reply here or WhatsApp ${site.phone}. Happy to help. — Danny`
      : `¿Necesitas cambiar la hora? Escríbeme por aquí o por WhatsApp ${site.phone}. Con gusto te ayudo. — Danny`,
  });
}

/** Notification to Danny when someone books. */
export function bookingOwnerEmail(opts: {
  name: string;
  email: string;
  phone: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
  meetLink?: string | null;
  calendarLink?: string | null;
  bookingId: string;
}) {
  const tz = opts.timezone === "America/Merida" ? "CST (Mérida, Yucatán)" : opts.timezone;
  return renderBrandEmail({
    lang: "es",
    eyebrow: "Nueva consulta en el calendario",
    title: `${opts.name} agendó contigo`,
    greeting: "Danny,",
    intro: "Alguien reservó una consulta desde dannydev.space. El evento ya está en tu Calendar; aquí tienes sus datos por si quieres escribirle antes de la llamada.",
    detailsTitle: "Quién y cuándo",
    rows: [
      { label: "Nombre", value: opts.name },
      { label: "Email", value: opts.email },
      { label: "Tel / WhatsApp", value: opts.phone },
      { label: "Fecha", value: opts.dateLabel },
      { label: "Hora", value: `${opts.timeLabel} (${tz})` },
      { label: "ID", value: opts.bookingId },
    ],
    ctaLabel: opts.meetLink ? "Abrir Google Meet" : undefined,
    ctaHref: opts.meetLink || undefined,
    ctaSecondaryLabel: "Escribirle por correo",
    ctaSecondaryHref: mailtoHref(
      opts.email,
      `Re: consulta ${opts.dateLabel}`,
      `Hola ${opts.name},\n\n`,
    ),
    footerNote: "Aviso interno · dannydev.space",
  });
}

/** Confirmation to the person who wrote via the form. */
export function messageVisitorEmail(opts: {
  locale: string;
  name: string;
  message: string;
  email: string;
}) {
  const en = opts.locale.startsWith("en");
  const preview =
    opts.message.length > 280 ? `${opts.message.slice(0, 280).trim()}…` : opts.message;
  return renderBrandEmail({
    lang: en ? "en" : "es",
    eyebrow: en ? "Thanks for reaching out" : "Gracias por escribirme",
    title: en ? "I received your message" : "Recibí tu mensaje",
    greeting: en ? `Hi ${opts.name},` : `Hola ${opts.name},`,
    intro: en
      ? "Thank you for getting in touch through dannydev.space — I really appreciate you taking the time. I read every message personally and I’ll get back to you by email or WhatsApp as soon as I can. If something is urgent, feel free to follow up; I’m happy to help."
      : "Gracias por escribirme desde dannydev.space — de verdad aprecio que te hayas tomado el tiempo. Leo cada mensaje personalmente y te respondo por correo o WhatsApp lo antes posible. Si te urge, puedes escribirme de nuevo; con gusto te atiendo.",
    detailsTitle: en ? "What you shared" : "Lo que me compartiste",
    rows: [{ label: en ? "Your note" : "Tu nota", value: preview }],
    ctaLabel: en ? "Browse the portfolio" : "Ver el portafolio",
    ctaHref: en ? `${SITE}/en/portafolio/` : `${SITE}/portafolio/`,
    ctaSecondaryLabel: en ? "Reply to this email" : "Responder este correo",
    ctaSecondaryHref: mailtoHref(
      site.email,
      en ? `Re: my message on dannydev.space` : `Re: mi mensaje en dannydev.space`,
      en ? `Hi Danny,\n\n` : `Hola Danny,\n\n`,
    ),
    footerNote: en
      ? `If this wasn’t you, ignore this note. — Danny Cen · ${site.phone}`
      : `Si no fuiste tú, ignora este correo. — Danny Cen · ${site.phone}`,
  });
}

/** Notification to Danny when someone sends a message. */
export function messageOwnerEmail(opts: {
  name: string;
  email: string;
  phone: string;
  message: string;
  messageId: string;
  sourcePath?: string | null;
}) {
  return renderBrandEmail({
    lang: "es",
    eyebrow: "Nuevo mensaje del sitio",
    title: `${opts.name} quiere que lo contactes`,
    greeting: "Danny,",
    intro: "Te escribieron desde el formulario de dannydev.space. Aquí tienes sus datos y el mensaje para que puedas responderles cuando puedas.",
    detailsTitle: "Datos y mensaje",
    rows: [
      { label: "Nombre", value: opts.name },
      { label: "Email", value: opts.email },
      { label: "Tel / WhatsApp", value: opts.phone },
      ...(opts.sourcePath ? [{ label: "Desde", value: opts.sourcePath }] : []),
      { label: "ID", value: opts.messageId },
      { label: "Mensaje", value: opts.message },
    ],
    ctaLabel: "Responder por correo",
    ctaHref: mailtoHref(opts.email, `Re: tu mensaje en dannydev.space`, `Hola ${opts.name},\n\n`),
    ctaSecondaryLabel: "Abrir WhatsApp",
    ctaSecondaryHref: whatsappHref(opts.phone),
    footerNote: "Aviso interno · dannydev.space",
  });
}
