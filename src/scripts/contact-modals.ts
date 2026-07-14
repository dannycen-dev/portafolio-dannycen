/**
 * Contact page modals: booking calendar + visitor message form.
 */

function openModal(dialog: HTMLDialogElement) {
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("modal-open");
  const focusable = dialog.querySelector<HTMLElement>(
    "button:not([data-modal-close]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
  );
  focusable?.focus();
}

function closeModal(dialog: HTMLDialogElement) {
  if (dialog.open) dialog.close();
  if (!document.querySelector("dialog[open]")) {
    document.body.classList.remove("modal-open");
  }
}

function bindModals() {
  document.querySelectorAll<HTMLElement>("[data-modal-open]").forEach((trigger) => {
    trigger.onclick = () => {
      const id = trigger.dataset.modalOpen;
      if (!id) return;
      const dialog = document.querySelector<HTMLDialogElement>(`[data-modal="${id}"]`);
      if (dialog) openModal(dialog);
    };
  });

  document.querySelectorAll<HTMLDialogElement>("dialog[data-modal]").forEach((dialog) => {
    dialog.querySelectorAll<HTMLElement>("[data-modal-close]").forEach((btn) => {
      btn.onclick = () => closeModal(dialog);
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeModal(dialog);
    });

    dialog.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) {
        document.body.classList.remove("modal-open");
      }
    });
  });
}

function bindContactForm() {
  document.querySelectorAll<HTMLFormElement>("[data-contact-form]").forEach((form) => {
    form.onsubmit = async (event) => {
      event.preventDefault();
      const email = form.dataset.email || "";
      const subjectTpl = form.dataset.subjectTpl || "Message from {name}";
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const visitorEmail = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const message = String(data.get("message") || "").trim();
      if (!name || !visitorEmail || !phone || !message) return;

      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submit) {
        submit.disabled = true;
      }

      try {
        const res = await fetch("/api/messages/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: visitorEmail,
            phone,
            message,
            locale: document.documentElement.lang?.startsWith("en") ? "en" : "es",
            sourcePath: window.location.pathname,
          }),
        });
        const payload = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !payload.ok) {
          throw new Error(payload.error || `HTTP ${res.status}`);
        }
        const dialog = form.closest("dialog");
        if (dialog instanceof HTMLDialogElement) closeModal(dialog);
        form.reset();
      } catch (err) {
        console.error(err);
        const subject = subjectTpl.replaceAll("{name}", name);
        const body = [
          `Nombre: ${name}`,
          `Name: ${name}`,
          `Email: ${visitorEmail}`,
          `Teléfono / WhatsApp: ${phone}`,
          `Phone / WhatsApp: ${phone}`,
          "",
          "Mensaje / Message:",
          message,
          "",
          "— dannydev.space/contact",
        ].join("\n");
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } finally {
        if (submit) submit.disabled = false;
      }
    };
  });
}

function boot() {
  bindModals();
  bindContactForm();
}

boot();
document.addEventListener("astro:page-load", boot);
