import { dayOfWeekFromDate } from "./slots";

export const DEFAULT_HOST_TZ = "America/Merida";
const MERIDA_OFFSET = "-06:00";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Wall-clock slot in the host timezone (Merida CST). */
export function slotInstant(dateYmd: string, slot: string): Date {
  return new Date(`${dateYmd}T${slot}:00${MERIDA_OFFSET}`);
}

export function viewerTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_HOST_TZ;
  } catch {
    return DEFAULT_HOST_TZ;
  }
}

export function meridaTodayYmd(now = new Date()): string {
  return ymdInTimezone(now, DEFAULT_HOST_TZ);
}

export function ymdInTimezone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function formatTimeInTz(instant: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(instant);
}

export function formatShortDateInTz(instant: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(instant);
}

export function formatMeridaDateLabel(dateYmd: string, locale: string): string {
  const instant = new Date(`${dateYmd}T12:00:00${MERIDA_OFFSET}`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: DEFAULT_HOST_TZ,
  }).format(instant);
}

export function formatMeridaDateLabelLong(dateYmd: string, locale: string): string {
  const instant = new Date(`${dateYmd}T12:00:00${MERIDA_OFFSET}`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DEFAULT_HOST_TZ,
  }).format(instant);
}

export function timezoneLabel(timeZone: string, locale: string): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || timeZone;
  } catch {
    return timeZone;
  }
}

export type SlotDisplay = {
  primary: string;
  secondary?: string;
  dayNote?: string;
};

export function formatSlotForViewer(
  dateYmd: string,
  slot: string,
  locale: string,
  hostTz = DEFAULT_HOST_TZ,
  viewerTz = viewerTimezone(),
  hostTzLabel?: string,
): SlotDisplay {
  const instant = slotInstant(dateYmd, slot);
  const viewerTime = formatTimeInTz(instant, locale, viewerTz);

  if (viewerTz === hostTz) {
    return { primary: viewerTime };
  }

  const hostTime = formatTimeInTz(instant, locale, hostTz);
  const viewerYmd = ymdInTimezone(instant, viewerTz);
  const hostShort = hostTzLabel || timezoneLabel(hostTz, locale);

  return {
    primary: viewerTime,
    secondary: `${hostTime} ${hostShort}`,
    dayNote: viewerYmd !== dateYmd ? formatShortDateInTz(instant, locale, viewerTz) : undefined,
  };
}

export function meridaMonthLength(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function shiftMeridaMonth(year: number, month: number, delta: number) {
  let m = month + delta;
  let y = year;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return { year: y, month: m };
}

export function meridaWeekday(dateYmd: string): number {
  return dayOfWeekFromDate(dateYmd);
}

export function meridaYmd(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function compareYmd(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
