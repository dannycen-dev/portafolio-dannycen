/**
 * Booking flow (lightweight CSS + minimal JS):
 * 1) pick date → reveal slots
 * 2) pick time → reveal name + phone
 * 3) fill details → enable confirm → mailto
 */

import { getSlotsForDay, isBookableDay } from "../lib/booking/slots";

type BookingRoot = HTMLElement & {
  dataset: DOMStringMap & {
    locale?: string;
    email?: string;
    tzLabel?: string;
    via?: string;
    subjectTpl?: string;
    bodyTpl?: string;
    needDate?: string;
    needTime?: string;
  };
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), tpl);
}

function formatSlot(locale: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(d);
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
  const tzLabel = root.dataset.tzLabel || "";
  const via = root.dataset.via || "Google Meet / Zoom";
  let slots: string[] = [];
  const subjectTpl = root.dataset.subjectTpl || "";
  const bodyTpl = root.dataset.bodyTpl || "";
  const needDate = root.dataset.needDate || "";
  const needTime = root.dataset.needTime || "";

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

  const today = startOfDay(new Date());
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate: Date | null = null;
  let selectedSlot: string | null = null;
  const AVAILABILITY_POLL_MS = 45_000;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function stopAvailabilityPoll() {
    if (pollTimer != null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startAvailabilityPoll(day: Date) {
    stopAvailabilityPoll();
    pollTimer = setInterval(() => {
      if (!selectedDate || ymd(selectedDate) !== ymd(day)) {
        stopAvailabilityPoll();
        return;
      }
      void refreshAvailabilityForSelected();
    }, AVAILABILITY_POLL_MS);
  }

  async function refreshAvailabilityForSelected() {
    if (!selectedDate) return;
    const day = selectedDate;
    const prevSlot = selectedSlot;
    await loadAvailability(day);
    if (!selectedDate || ymd(selectedDate) !== ymd(day)) return;
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

  function isBookable(date: Date) {
    if (!isBookableDay(date.getDay())) return false;
    return startOfDay(date) >= today;
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
    confirmBtn!.disabled = !(selectedDate && selectedSlot && guestReady());
  }

  function syncSteps() {
    const hasDate = Boolean(selectedDate);
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
      selectedLabel!.textContent = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(selectedDate!);
    }

    syncConfirm();
  }

  function renderSlots() {
    slotsEl!.innerHTML = "";
    if (!selectedDate) {
      syncSteps();
      return;
    }

    selectedLabel!.textContent = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(selectedDate);

    for (const [index, slot] of slots.entries()) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = formatSlot(locale, slot);
      btn.dataset.slot = slot;
      btn.style.setProperty("--i", String(index));
      if (selectedSlot === slot) btn.classList.add("is-selected");
      btn.addEventListener("click", () => {
        selectedSlot = slot;
        slotsEl!.querySelectorAll("button").forEach((el) => {
          el.classList.toggle("is-selected", el.getAttribute("data-slot") === slot);
        });
        syncSteps();
        window.setTimeout(() => nameInput!.focus(), 280);
      });
      slotsEl!.appendChild(btn);
    }

    syncSteps();
  }

  function renderCalendar() {
    monthEl!.textContent = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(view);

    gridEl!.innerHTML = "";
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    for (let i = 0; i < firstDow; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.disabled = true;
      btn.className = "is-muted";
      btn.textContent = String(prevDays - firstDow + 1 + i);
      gridEl!.appendChild(btn);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(day);
      btn.dataset.date = ymd(date);
      const bookable = isBookable(date);
      if (!bookable) {
        btn.disabled = true;
        btn.classList.add("is-muted");
      }
      if (selectedDate && ymd(selectedDate) === ymd(date)) {
        btn.classList.add("is-selected");
      }
      if (bookable) {
        btn.addEventListener("click", () => {
          selectedDate = date;
          selectedSlot = null;
          nameInput.value = "";
          emailInput.value = "";
          phoneInput.value = "";
          slots = getSlotsForDay(date.getDay());
          setReveal(guestEl!, false);
          renderCalendar();
          renderSlots();
          void refreshAvailabilityForSelected().then(() => startAvailabilityPoll(date));
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
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      renderCalendar();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      renderCalendar();
    };
  }

  nameInput.oninput = syncConfirm;
  emailInput.oninput = syncConfirm;
  phoneInput.oninput = syncConfirm;

  const loadAvailability = async (day: Date) => {
    const daySlots = getSlotsForDay(day.getDay());
    slots = daySlots;
    try {
      const res = await fetch(`/api/bookings/?date=${ymd(day)}`);
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
    if (!selectedDate || !selectedSlot || !guestReady()) {
      selectedLabel.textContent = !selectedDate ? needDate : needTime;
      syncConfirm();
      return;
    }
    const name = nameInput.value.trim();
    const guestEmail = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const dateLabel = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(selectedDate);
    const timeLabel = formatSlot(locale, selectedSlot);

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
          date: ymd(selectedDate),
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
      await loadAvailability(selectedDate);
      startAvailabilityPoll(selectedDate);
      renderSlots();
      syncConfirm();
      const dialog = root.closest("dialog");
      if (dialog instanceof HTMLDialogElement) {
        window.setTimeout(() => dialog.close(), 1600);
      }
    } catch (err) {
      // Fallback: open mailto so the lead is never lost offline
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
        tz: tzLabel,
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
    if (selectedDate) startAvailabilityPoll(selectedDate);
  });

  // Hook day selection: re-query availability after calendar re-render clicks
  root.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement | null)?.closest?.<HTMLButtonElement>("[data-day]");
    if (!btn || btn.disabled) return;
    window.setTimeout(() => {
      if (selectedDate) {
        void loadAvailability(selectedDate).then(() => {
          renderSlots();
          syncConfirm();
        });
      }
    }, 0);
  });

  selectedDate = null;
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
