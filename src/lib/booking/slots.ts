/**
 * Booking availability (CST — America/Mérida).
 * 30-minute appointments; slot starts every 15 minutes.
 */

const SLOT_STEP_MIN = 15;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(h: number, m: number) {
  return `${pad(h)}:${pad(m)}`;
}

/** Inclusive last start time so a 30-min meeting fits in the window. */
function slotsBetween(
  startH: number,
  startM: number,
  lastStartH: number,
  lastStartM: number,
): string[] {
  const out: string[] = [];
  let t = startH * 60 + startM;
  const end = lastStartH * 60 + lastStartM;
  while (t <= end) {
    out.push(formatTime(Math.floor(t / 60), t % 60));
    t += SLOT_STEP_MIN;
  }
  return out;
}

/** 14:00–14:45 window → last starts at 14:00 or 14:15. */
const AFTERNOON = slotsBetween(14, 0, 14, 15);

/** Mon/Wed/Fri evening — last start 21:30 (ends 22:00). */
const EVENING = slotsBetween(18, 0, 21, 30);

/** Saturday — last start 16:30 (ends 17:00). */
const SATURDAY = slotsBetween(11, 30, 16, 30);

/** Day of week for YYYY-MM-DD in America/Mérida (0 = Sunday). */
export function dayOfWeekFromDate(date: string): number {
  return new Date(`${date}T12:00:00-06:00`).getUTCDay();
}

/** Sunday is never bookable; all other days may have slots. */
export function isBookableDay(dayOfWeek: number): boolean {
  return dayOfWeek !== 0;
}

/**
 * Allowed start times for a weekday index (0 = Sunday … 6 = Saturday).
 * - Sun: none
 * - Mon/Wed/Fri: 14:00–14:45 + 18:00–22:00
 * - Tue/Thu: 14:00–14:45 only
 * - Sat: 11:30–17:00
 */
export function getSlotsForDay(dayOfWeek: number): string[] {
  switch (dayOfWeek) {
    case 0:
      return [];
    case 1:
    case 3:
    case 5:
      return [...AFTERNOON, ...EVENING];
    case 2:
    case 4:
      return [...AFTERNOON];
    case 6:
      return [...SATURDAY];
    default:
      return [];
  }
}

export function getSlotsForDate(date: string): string[] {
  return getSlotsForDay(dayOfWeekFromDate(date));
}
