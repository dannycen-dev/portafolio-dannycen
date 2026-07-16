/** Busy interval from Google Calendar FreeBusy (RFC3339). */
export type BusyPeriod = { start: string; end: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Next calendar day for YYYY-MM-DD in America/Mérida. */
export function addMeridaDay(date: string): string {
  const d = new Date(`${date}T12:00:00-06:00`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function slotRangeMs(date: string, slot: string, durationMin: number) {
  const start = new Date(`${date}T${slot}:00-06:00`).getTime();
  return { start, end: start + durationMin * 60_000 };
}

/** True when a {durationMin}-minute meeting starting at {slot} overlaps any busy period. */
export function slotOverlapsBusy(
  date: string,
  slot: string,
  durationMin: number,
  busy: BusyPeriod[],
): boolean {
  const range = slotRangeMs(date, slot, durationMin);
  return busy.some((b) => {
    const bStart = new Date(b.start).getTime();
    const bEnd = new Date(b.end).getTime();
    return range.start < bEnd && range.end > bStart;
  });
}

export function filterAvailableSlots(
  date: string,
  slots: string[],
  taken: Set<string>,
  busy: BusyPeriod[],
  durationMin: number,
): string[] {
  return slots.filter(
    (slot) => !taken.has(slot) && !slotOverlapsBusy(date, slot, durationMin, busy),
  );
}

export function slotsBlockedByCalendar(
  date: string,
  slots: string[],
  busy: BusyPeriod[],
  durationMin: number,
): string[] {
  return slots.filter((slot) => slotOverlapsBusy(date, slot, durationMin, busy));
}
