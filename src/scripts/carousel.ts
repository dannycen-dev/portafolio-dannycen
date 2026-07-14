/**
 * Infinite carousel via translate3d — no scrollLeft teleport, so no loop flicker.
 * Duplicates the slide set once and wraps the offset when a full cycle completes.
 */

const AUTOPLAY_MS = 4000;
const EASE_MS = 520;

function gapOf(el: HTMLElement) {
  const styles = getComputedStyle(el);
  return parseFloat(styles.columnGap || styles.gap) || 16;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bindCarousel(root: HTMLElement) {
  if (root.dataset.bound === "1") return;
  root.dataset.bound = "1";

  const track = root.querySelector<HTMLElement>("[data-carousel-track]");
  const prev = root.querySelector<HTMLElement>("[data-carousel-prev]");
  const next = root.querySelector<HTMLElement>("[data-carousel-next]");
  const count = root.querySelector<HTMLElement>("[data-carousel-count]");
  if (!track) return;

  const originals = [...track.querySelectorAll<HTMLElement>(".carousel__slide")];
  const total = originals.length;
  if (total < 1) return;

  if (total > 1 && !track.dataset.cloned) {
    const frag = document.createDocumentFragment();
    for (const slide of originals) {
      const clone = slide.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
      frag.appendChild(clone);
    }
    track.append(frag);
    track.dataset.cloned = "1";
  }

  let index = 0;
  let offset = 0;
  let animating = false;
  let autoplayId = 0;
  let interacting = false;

  const stepWidth = () => {
    const slide = track.querySelector(".carousel__slide");
    if (!slide) return 0;
    return slide.getBoundingClientRect().width + gapOf(track);
  };

  const cycleWidth = () => stepWidth() * total;

  const render = (withTransition: boolean) => {
    if (withTransition && !prefersReducedMotion()) {
      track.style.transition = `transform ${EASE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    } else {
      track.style.transition = "none";
    }
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  };

  const updateCount = () => {
    if (!count) return;
    const safe = ((index % total) + total) % total;
    count.textContent = `${safe + 1} / ${total}`;
  };

  const goTo = (nextIndex: number) => {
    if (total <= 1 || animating) return;
    const step = stepWidth();
    if (step <= 0) return;

    animating = true;
    index = nextIndex;
    offset = index * step;
    render(true);
    updateCount();

    const finish = () => {
      if (index >= total) {
        index -= total;
        offset = index * step;
        render(false);
        // Force style flush so the next transition starts clean.
        void track.getBoundingClientRect();
      } else if (index < 0) {
        index += total;
        offset = index * step;
        render(false);
        void track.getBoundingClientRect();
      }
      animating = false;
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    const onEnd = (event: TransitionEvent) => {
      if (event.target !== track || event.propertyName !== "transform") return;
      track.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
      finish();
    };
    track.addEventListener("transitionend", onEnd);
    const fallback = window.setTimeout(() => {
      track.removeEventListener("transitionend", onEnd);
      finish();
    }, EASE_MS + 80);
  };

  const scrollByDir = (dir: number) => {
    goTo(index + dir);
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = 0;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (total <= 1 || prefersReducedMotion() || interacting) return;
    autoplayId = window.setInterval(() => {
      if (document.hidden || interacting || animating) return;
      scrollByDir(1);
    }, AUTOPLAY_MS);
  };

  prev?.addEventListener("click", () => {
    scrollByDir(-1);
    startAutoplay();
  });
  next?.addEventListener("click", () => {
    scrollByDir(1);
    startAutoplay();
  });

  const pause = () => {
    interacting = true;
    stopAutoplay();
  };
  const resume = () => {
    interacting = false;
    startAutoplay();
  };

  root.addEventListener("pointerenter", pause);
  root.addEventListener("pointerleave", resume);
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) resume();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Drag / swipe support via pointer on the viewport.
  const viewport = track.parentElement;
  if (viewport) {
    let startX = 0;
    let startOffset = 0;
    let dragging = false;

    viewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      interacting = true;
      stopAutoplay();
      startX = event.clientX;
      startOffset = offset;
      track.style.transition = "none";
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      offset = startOffset - (event.clientX - startX);
      render(false);
    });

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = event.clientX - startX;
      const step = stepWidth();
      if (Math.abs(dx) > step * 0.18) {
        goTo(index + (dx < 0 ? 1 : -1));
      } else {
        goTo(index);
      }
      interacting = false;
      startAutoplay();
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
  }

  render(false);
  updateCount();

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) startAutoplay();
      else stopAutoplay();
    },
    { threshold: 0.2 },
  );
  io.observe(root);

  window.addEventListener(
    "resize",
    () => {
      offset = index * stepWidth();
      // Keep within first cycle after resize.
      const cycle = cycleWidth();
      if (cycle > 0 && offset >= cycle) {
        index = index % total;
        offset = index * stepWidth();
      }
      render(false);
      updateCount();
    },
    { passive: true },
  );
}

export function bindCarousels() {
  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach(bindCarousel);
}

bindCarousels();
document.addEventListener("astro:page-load", bindCarousels);
