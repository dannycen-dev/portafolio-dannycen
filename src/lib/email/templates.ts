/**
 * Branded transactional email templates (HTML + plain text).
 * Colors / typography mirror dannydev.space (teal #155f58, mist bg).
 * Table-based layout for Outlook + mobile clients.
 */

export type BrandEmailCopy = {
  eyebrow: string;
  title: string;
  greeting: string;
  intro: string;
  detailsTitle: string;
  rows: { label: string; value: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  footerNote: string;
};

const ACCENT = "#155f58";
const ACCENT_DEEP = "#0b3d39";
const BG = "#eef1ef";
const INK = "#101412";
const MUTED = "#4d5650";
const SURFACE = "#ffffff";
const SITE = "https://dannydev.space";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderBrandEmail(copy: BrandEmailCopy): { html: string; text: string } {
  const rowsHtml = copy.rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(16,20,18,0.12);font-family:Figtree,Helvetica,Arial,sans-serif;font-size:13px;color:${MUTED};width:38%;vertical-align:top;">${esc(r.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(16,20,18,0.12);font-family:Figtree,Helvetica,Arial,sans-serif;font-size:15px;color:${INK};font-weight:600;vertical-align:top;">${esc(r.value)}</td>
      </tr>`,
    )
    .join("");

  const cta =
    copy.ctaHref && copy.ctaLabel
      ? `
        <tr>
          <td style="padding:28px 0 8px;">
            <a href="${esc(copy.ctaHref)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.02em;padding:14px 22px;">${esc(copy.ctaLabel)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 8px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};word-break:break-all;">
            ${esc(copy.ctaHref)}
          </td>
        </tr>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="es">
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
                  <td style="padding-left:12px;font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${ACCENT_DEEP};">Danny Cen</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${SURFACE};padding:28px 24px;border-top:3px solid ${ACCENT};">
              <p style="margin:0 0 8px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};font-weight:700;">${esc(copy.eyebrow)}</p>
              <h1 style="margin:0 0 16px;font-family:Syne,Figtree,Helvetica,Arial,sans-serif;font-size:26px;line-height:1.2;color:${ACCENT_DEEP};font-weight:800;">${esc(copy.title)}</h1>
              <p style="margin:0 0 10px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:16px;color:${INK};">${esc(copy.greeting)}</p>
              <p style="margin:0 0 22px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${MUTED};">${esc(copy.intro)}</p>
              <p style="margin:0 0 8px;font-family:Figtree,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${ACCENT};font-weight:700;">${esc(copy.detailsTitle)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
              ${cta}
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
    copy.eyebrow,
    copy.title,
    "",
    copy.greeting,
    copy.intro,
    "",
    copy.detailsTitle,
    ...copy.rows.map((r) => `${r.label}: ${r.value}`),
    copy.ctaHref ? `\n${copy.ctaLabel || "Link"}: ${copy.ctaHref}` : "",
    "",
    copy.footerNote,
    SITE,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return { html, text };
}

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
  return renderBrandEmail({
    eyebrow: en ? "Booking confirmed" : "Cita confirmada",
    title: en ? "See you on the call" : "Nos vemos en la videollamada",
    greeting: en ? `Hi ${opts.name},` : `Hola ${opts.name},`,
    intro: en
      ? "Your automation & systems consult is booked. You’ll get a Google Calendar invite from dannycen.dev@gmail.com — here are the details."
      : "Tu consulta de automatización y sistemas quedó agendada. Recibirás también la invitación de Google Calendar desde dannycen.dev@gmail.com — aquí el resumen.",
    detailsTitle: en ? "Appointment" : "Detalle de la cita",
    rows: [
      { label: en ? "Date" : "Fecha", value: opts.dateLabel },
      { label: en ? "Time" : "Hora", value: `${opts.timeLabel} (${opts.timezone})` },
      { label: en ? "Duration" : "Duración", value: en ? "30 min" : "30 min" },
      { label: en ? "Via" : "Vía", value: "Google Meet" },
      { label: en ? "Phone / WhatsApp" : "Teléfono / WhatsApp", value: opts.phone },
    ],
    ctaLabel: opts.meetLink ? (en ? "Join Google Meet" : "Entrar a Google Meet") : undefined,
    ctaHref: opts.meetLink || undefined,
    footerNote: en
      ? "Need to reschedule? Reply to this email or WhatsApp me. — Danny Cen"
      : "¿Necesitas reprogramar? Responde este correo o escríbeme por WhatsApp. — Danny Cen",
  });
}

export function bookingOwnerEmail(opts: {
  name: string;
  email: string;
  phone: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
  meetLink?: string | null;
  bookingId: string;
}) {
  return renderBrandEmail({
    eyebrow: "Nueva cita",
    title: `Cita con ${opts.name}`,
    greeting: "Hola Danny,",
    intro: "Alguien agendó una consulta desde dannydev.space. La invitación de Calendar ya está en tu bandeja.",
    detailsTitle: "Lead",
    rows: [
      { label: "Nombre", value: opts.name },
      { label: "Email", value: opts.email },
      { label: "Teléfono", value: opts.phone },
      { label: "Fecha", value: opts.dateLabel },
      { label: "Hora", value: `${opts.timeLabel} (${opts.timezone})` },
      { label: "Booking ID", value: opts.bookingId },
    ],
    ctaLabel: opts.meetLink ? "Abrir Meet" : undefined,
    ctaHref: opts.meetLink || undefined,
    footerNote: "Notificación interna · dannydev.space",
  });
}

export function messageVisitorEmail(opts: { locale: string; name: string; message: string }) {
  const en = opts.locale.startsWith("en");
  const preview =
    opts.message.length > 220 ? `${opts.message.slice(0, 220).trim()}…` : opts.message;
  return renderBrandEmail({
    eyebrow: en ? "Message received" : "Mensaje recibido",
    title: en ? "Thanks — I’ll get back to you" : "Gracias — te contacto pronto",
    greeting: en ? `Hi ${opts.name},` : `Hola ${opts.name},`,
    intro: en
      ? "I received your note from dannydev.space. I’ll reply by email or WhatsApp with next steps."
      : "Recibí tu mensaje desde dannydev.space. Te respondo por correo o WhatsApp con los siguientes pasos.",
    detailsTitle: en ? "Your message" : "Tu mensaje",
    rows: [{ label: en ? "Preview" : "Vista previa", value: preview }],
    footerNote: en
      ? "If this wasn’t you, you can ignore this email. — Danny Cen"
      : "Si no fuiste tú, ignora este correo. — Danny Cen",
  });
}

export function messageOwnerEmail(opts: {
  name: string;
  email: string;
  phone: string;
  message: string;
  messageId: string;
  sourcePath?: string | null;
}) {
  return renderBrandEmail({
    eyebrow: "Nuevo mensaje",
    title: `Lead · ${opts.name}`,
    greeting: "Hola Danny,",
    intro: "Nuevo mensaje desde el formulario de dannydev.space.",
    detailsTitle: "Contacto",
    rows: [
      { label: "Nombre", value: opts.name },
      { label: "Email", value: opts.email },
      { label: "Teléfono", value: opts.phone },
      { label: "ID", value: opts.messageId },
      ...(opts.sourcePath ? [{ label: "Path", value: opts.sourcePath }] : []),
      { label: "Mensaje", value: opts.message },
    ],
    footerNote: "Notificación interna · dannydev.space",
  });
}
