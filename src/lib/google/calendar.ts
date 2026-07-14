import { getGoogleAccessToken, type GoogleAuthEnv } from "./auth";

export type CalendarEnv = GoogleAuthEnv & {
  GOOGLE_CALENDAR_ID?: string;
  BOOKING_DURATION_MIN?: string;
  BOOKING_TIMEZONE?: string;
};

export type CreateEventInput = {
  summary: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM in America/Merida wall time */
  slot: string;
  attendeeEmail?: string;
};

export type CreatedEvent = {
  eventId: string;
  htmlLink?: string;
  meetLink?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Build RFC3339 local datetime with fixed -06:00 (Mérida CST, no DST). */
function toRfc3339Local(date: string, slot: string, durationMin: number) {
  const [h, m] = slot.split(":").map(Number);
  const start = `${date}T${pad(h)}:${pad(m)}:00-06:00`;
  const total = h * 60 + m + durationMin;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  const end = `${date}T${pad(eh)}:${pad(em)}:00-06:00`;
  return { start, end };
}

export async function createCalendarEvent(
  env: CalendarEnv,
  input: CreateEventInput,
): Promise<CreatedEvent> {
  const token = await getGoogleAccessToken(env);
  const calendarId = encodeURIComponent(env.GOOGLE_CALENDAR_ID || "primary");
  const duration = Number(env.BOOKING_DURATION_MIN || "30") || 30;
  const { start, end } = toRfc3339Local(input.date, input.slot, duration);
  const timezone = env.BOOKING_TIMEZONE || "America/Merida";

  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: start, timeZone: timezone },
    end: { dateTime: end, timeZone: timezone },
    reminders: { useDefault: true },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  if (input.attendeeEmail) {
    body.attendees = [{ email: input.attendeeEmail }];
  }

  const qs = new URLSearchParams({
    conferenceDataVersion: "1",
    sendUpdates: input.attendeeEmail ? "all" : "none",
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${qs}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    id?: string;
    htmlLink?: string;
    hangoutLink?: string;
    error?: { message?: string };
    conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
  };

  if (!res.ok || !data.id) {
    throw new Error(data.error?.message || `Calendar create failed (${res.status})`);
  }

  const meet =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;

  return { eventId: data.id, htmlLink: data.htmlLink, meetLink: meet };
}
