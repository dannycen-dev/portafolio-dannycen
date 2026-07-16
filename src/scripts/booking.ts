/**
 * Booking flow (lightweight CSS + minimal JS):
 * 1) pick date → reveal slots
 * 2) pick time → reveal name + phone
 * 3) fill details → enable confirm → mailto
 *
 * Host availability is defined in America/Mérida; slots render in the visitor timezone.
 */

import { getSlotsForDay, isBookableDay } from "../lib/booking/slots";
import {
  compareYmd,
  DEFAULT_HOST_TZ,
  formatMeridaDateLabel,
  formatMeridaDateLabelLong,
  formatSlotForViewer,
  meridaMonthLength,
  meridaTodayYmd,
  meridaWeekday,
  meridaYmd,
  shiftMeridaMonth,
  timezoneLabel,
  viewerTimezone,
} from "../lib/booking/timezone";

type BookingRoot = HTMLElement & {
  dataset: DOMStringMap & {
    locale?: string;
    email?: string;
    tz?: string;
    tzLabel?: string;
    via?: string;
    yourTzLabel?: string;
    subjectTpl?: string;
    bodyTpl?: string;
    needDate?: string;
    needTime?: string;
  };
};

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), tpl);
}

function weekdayLabels(locale: string) {
  const base = new Date(2024, 0, 7); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(d)
      .replace(/\./g, "")
      .toUpperCase()
      .slice(0, 3);
  });
}

function setReveal(el: HTMLElement, open: boolean) {
  el.classList.toggle("is-open", open);
  el.setAttribute("aria-hidden", open ? "false" : "true");
}

function mount(root: BookingRoot) {
  const locale = root.dataset.locale || "es-MX";
  const email = root.dataset.email || "";
  const hostTz = root.dataset.tz || DEFAULT_HOST_TZ;
  const hostTzLabel = root.dataset.tzLabel || timezoneLabel(hostTz, locale);
  const viewerTz = viewerTimezone();
  const via = root.dataset.via || "Google Meet / Zoom";
  let slots: string[] = [];
  const subjectTpl = root.dataset.subjectTpl || "";
  const bodyTpl = root.dataset.bodyTpl || "";
  const needDate = root.dataset.needDate || "";
  const needTime = root.dataset.needTime || "";
  const yourTzLabelTpl = root.dataset.yourTzLabel || "Your timezone: {tz}";

  const monthEl = root.querySelector<HTMLElement>("[data-booking-month]");
  const weekdaysEl = root.querySelector<HTMLElement>("[data-booking-weekdays]");
  const gridEl = root.querySelector<HTMLElement>("[data-booking-grid]");
  const slotsWrap = root.querySelector<HTMLElement>("[data-booking-slots-wrap]");
  const slotsEl = root.querySelector<HTMLElement>("[data-booking-slots]");
  const guestEl = root.querySelector<HTMLElement>("[data-booking-guest]");
  const nameInput = root.querySelector<HTMLInputElement>("[data-booking-name]");
  const emailInput = root.querySelector<HTMLInputElement>("[data-booking-email]");
  const phoneInput = root.querySelector<HTMLInputElement>("[data-booking-phone]");
  const selectedLabel = root.querySelector<HTMLElement>("[data-booking-selected-label]");
  const confirmBtn = root.querySelector<HTMLButtonElement>("[data-booking-confirm]");
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-booking-prev]");
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-booking-next]");
  const viewerTzWrap = root.querySelector<HTMLElement>("[data-booking-viewer-tz-wrap]");
  const viewerTzEl = root.querySelector<HTMLElement>("[data-booking-viewer-tz]");

  if (
    !monthEl ||
    !weekdaysEl ||
    !gridEl ||
    !slotsWrap ||
    !slotsEl ||
    !guestEl ||
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !selectedLabel ||
    !confirmBtn
  ) {
    return;
  }

  const meridaToday = meridaTodayYmd();
  const todayParts = meridaToday.split("-").map(Number) as [number, number, number];
  let viewYear = todayParts[0];
  let viewMonth = todayParts[1];
  let selectedYmd: string | null = null;
  let selectedSlot: string | null = null;
  const AVAILABILITY_POLL_MS = 90_000;
  const REVISION_POLL_MS = 12_000;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let revisionTimer: ReturnType<typeof setInterval> | null = null;
  let lastRevision: number | null = null;

  if (viewerTzWrap && viewerTzEl && viewerTz !== hostTz) {
    viewerTzWrap.hidden = false;
    viewerTzEl.textContent = yourTzLabelTpl.replace("__TZ__", timezoneLabel(viewerTz, locale));
  }

  function stopAvailabilityPoll() {
    if (pollTimer != null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (revisionTimer != null) {
      clearInterval(revisionTimer);
      revisionTimer = null;
    }
    lastRevision = null;
  }

  async function pollCalendarRevision() {
    if (!selectedYmd) return;
    try {
      const res = await fetch("/api/calendar/revision/");
      if (!res.ok) return;
      const data = (await res.json()) as { revision?: number };
      if (typeof data.revision !== "number") return;
      if (lastRevision === null) {
        lastRevision = data.revision;
        return;
      }
      if (data.revision !== lastRevision) {
        lastRevision = data.revision;
        await refreshAvailabilityForSelected();
      }
    } catch {
      /* offline */
    }
  }

  function startAvailabilityPoll(ymd: string) {
    stopAvailabilityPoll();
    void pollCalendarRevision();
    revisionTimer = setInterval(() => {
      void pollCalendarRevision();
    }, REVISION_POLL_MS);
    pollTimer = setInterval(() => {
      if (!selectedYmd || selectedYmd !== ymd) {
        stopAvailabilityPoll();
        return;
      }
      void refreshAvailabilityForSelected();
    }, AVAILABILITY_POLL_MS);
  }

  async function refreshAvailabilityForSelected() {
    if (!selectedYmd) return;
    const ymd = selectedYmd;
    const prevSlot = selectedSlot;
    await loadAvailability(ymd);
    if (!selectedYmd || selectedYmd !== ymd) return;
    if (prevSlot && !slots.includes(prevSlot)) {
      selectedSlot = null;
      setReveal(guestEl!, false);
    }
    renderSlots();
    syncConfirm();
  }

  weekdaysEl.innerHTML = weekdayLabels(locale)
    .map((d) => `<span>${d}</span>`)
    .join("");

  function isBookable(ymd: string) {
    if (!isBookableDay(meridaWeekday(ymd))) return false;
    return compareYmd(ymd, meridaToday) >= 0;
  }

  function guestReady() {
    const em = emailInput.value.trim();
    return (
      nameInput.value.trim().length > 1 &&
      phoneInput.value.trim().length > 5 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)
    );
  }

  function syncConfirm() {
    confirmBtn!.disabled = !(selectedYmd && selectedSlot && guestReady());
  }

  function syncSteps() {
    const hasDate = Boolean(selectedYmd);
    const hasSlot = Boolean(selectedSlot);

    setReveal(slotsWrap!, hasDate);
    setReveal(guestEl!, hasDate && hasSlot);

    if (!hasDate) {
      stopAvailabilityPoll();
      selectedLabel!.textContent = needDate;
      selectedSlot = null;
      nameInput.value = "";
      emailInput.value = "";
      phoneInput.value = "";
    } else if (!hasSlot) {
      selectedLabel!.textContent = formatMeridaDateLabel(selectedYmd!, locale);
    }

    syncConfirm();
  }

  function renderSlotButton(slot: string, index: number) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.slot = slot;
    btn.style.setProperty("--i", String(index));

    const display = formatSlotForViewer(
      selectedYmd!,
      slot,
      locale,
      hostTz,
      viewerTz,
      hostTzLabel,
    );

    const primary = document.createElement("span");
    primary.className = "booking__slot-primary";
    primary.textContent = display.primary;
    btn.appendChild(primary);

    if (display.secondary) {
      const secondary = document.createElement("span");
      secondary.className = "booking__slot-secondary";
      secondary.textContent = display.secondary;
      btn.appendChild(secondary);
    }

    if (display.dayNote) {
      const dayNote = document.createElement("span");
      dayNote.className = "booking__slot-day";
      dayNote.textContent = display.dayNote;
      btn.appendChild(dayNote);
    }

    if (selectedSlot === slot) btn.classList.add("is-selected");
    btn.addEventListener("click", () => {
      selectedSlot = slot;
      slotsEl!.querySelectorAll("button").forEach((el) => {
        el.classList.toggle("is-selected", el.getAttribute("data-slot") === slot);
      });
      syncSteps();
      window.setTimeout(() => nameInput!.focus(), 280);
    });
    return btn;
  }

  function renderSlots() {
    slotsEl!.innerHTML = "";
    if (!selectedYmd) {
      syncSteps();
      return;
    }

    selectedLabel!.textContent = formatMeridaDateLabel(selectedYmd, locale);

    for (const [index, slot] of slots.entries()) {
      slotsEl!.appendChild(renderSlotButton(slot, index));
    }

    syncSteps();
  }

  function renderCalendar() {
    const monthInstant = new Date(`${meridaYmd(viewYear, viewMonth, 1)}T12:00:00-06:00`);
    monthEl!.textContent = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: hostTz,
    }).format(monthInstant);

    gridEl!.innerHTML = "";
    const firstDow = meridaWeekday(meridaYmd(viewYear, viewMonth, 1));
    const daysInMonth = meridaMonthLength(viewYear, viewMonth);
    const prevMonth = shiftMeridaMonth(viewYear, viewMonth, -1);
    const prevDays = meridaMonthLength(prevMonth.year, prevMonth.month);

    for (let i = 0; i < firstDow; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.disabled = true;
      btn.className = "is-muted";
      btn.textContent = String(prevDays - firstDow + 1 + i);
      gridEl!.appendChild(btn);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const ymd = meridaYmd(viewYear, viewMonth, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(day);
      btn.dataset.date = ymd;
      const bookable = isBookable(ymd);
      if (!bookable) {
        btn.disabled = true;
        btn.classList.add("is-muted");
      }
      if (selectedYmd === ymd) {
        btn.classList.add("is-selected");
      }
      if (bookable) {
        btn.addEventListener("click", () => {
          selectedYmd = ymd;
          selectedSlot = null;
          nameInput.value = "";
          emailInput.value = "";
          phoneInput.value = "";
          slots = getSlotsForDay(meridaWeekday(ymd));
          setReveal(guestEl!, false);
          renderCalendar();
          renderSlots();
          void refreshAvailabilityForSelected().then(() => startAvailabilityPoll(ymd));
        });
      }
      gridEl!.appendChild(btn);
    }

    const cells = firstDow + daysInMonth;
    const trailing = (7 - (cells % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.disabled = true;
      btn.className = "is-muted";
      btn.textContent = String(i);
      gridEl!.appendChild(btn);
    }
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      const prev = shiftMeridaMonth(viewYear, viewMonth, -1);
      viewYear = prev.year;
      viewMonth = prev.month;
      renderCalendar();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const next = shiftMeridaMonth(viewYear, viewMonth, 1);
      viewYear = next.year;
      viewMonth = next.month;
      renderCalendar();
    };
  }

  nameInput.oninput = syncConfirm;
  emailInput.oninput = syncConfirm;
  phoneInput.oninput = syncConfirm;

  const loadAvailability = async (ymd: string) => {
    const daySlots = getSlotsForDay(meridaWeekday(ymd));
    slots = daySlots;
    try {
      const res = await fetch(`/api/bookings/?date=${ymd}`);
      if (!res.ok) return;
      const data = (await res.json()) as { available?: string[]; booked?: string[] };
      if (Array.isArray(data.available)) {
        slots = data.available.length
          ? data.available
          : daySlots.filter((s) => !(data.booked || []).includes(s));
      }
    } catch {
      /* keep daySlots offline */
    }
  };

  confirmBtn.onclick = async () => {
    if (!selectedYmd || !selectedSlot || !guestReady()) {
      selectedLabel.textContent = !selectedYmd ? needDate : needTime;
      syncConfirm();
      return;
    }
    const name = nameInput.value.trim();
    const guestEmail = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const dateLabel = formatMeridaDateLabelLong(selectedYmd, locale);
    const timeLabel = formatSlotForViewer(
      selectedYmd,
      selectedSlot,
      locale,
      hostTz,
      viewerTz,
      hostTzLabel,
    ).primary;

    confirmBtn.disabled = true;
    const prevLabel = confirmBtn.textContent;
    confirmBtn.textContent = locale.startsWith("en") ? "Saving…" : "Guardando…";

    try {
      const res = await fetch("/api/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: guestEmail,
          phone,
          date: selectedYmd,
          slot: selectedSlot,
          locale: locale.startsWith("en") ? "en" : "es",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; meetLink?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      selectedLabel.textContent = locale.startsWith("en")
        ? `Booked ${dateLabel} · ${timeLabel}. Confirmation + Meet sent to your email.`
        : `Agendado ${dateLabel} · ${timeLabel}. Te envié confirmación y Meet por correo.`;
      nameInput.value = "";
      emailInput.value = "";
      phoneInput.value = "";
      selectedSlot = null;
      stopAvailabilityPoll();
      await loadAvailability(selectedYmd);
      startAvailabilityPoll(selectedYmd);
      renderSlots();
      syncConfirm();
      const dialog = root.closest("dialog");
      if (dialog instanceof HTMLDialogElement) {
        window.setTimeout(() => dialog.close(), 1600);
      }
    } catch (err) {
      const subject = fillTemplate(subjectTpl, {
        date: dateLabel,
        time: timeLabel,
        name,
        phone,
        email: guestEmail,
      });
      const body = fillTemplate(bodyTpl, {
        date: dateLabel,
        time: timeLabel,
        tz: hostTzLabel,
        via,
        name,
        phone,
        email: guestEmail,
      });
      console.error(err);
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      confirmBtn.textContent = prevLabel;
      syncConfirm();
    }
  };

  const dialog = root.closest("dialog");
  if (dialog instanceof HTMLDialogElement) {
    dialog.addEventListener("close", stopAvailabilityPoll);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAvailabilityPoll();
      return;
    }
    if (selectedYmd) startAvailabilityPoll(selectedYmd);
  });

  selectedYmd = null;
  selectedSlot = null;
  renderCalendar();
  renderSlots();
  syncSteps();
}

function boot() {
  document.querySelectorAll<BookingRoot>("[data-booking]").forEach((root) => {
    if (root.dataset.ready === "1") return;
    root.dataset.ready = "1";
    mount(root);
  });
}

boot();
document.addEventListener("astro:page-load", boot);
