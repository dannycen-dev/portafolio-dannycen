import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LOADER_KEY = "dc-loader-seen";

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Enable reveal animations only when JS is available — content stays visible without JS (SEO). */
function enableMotionClasses() {
  if (prefersReduced()) return;
  document.documentElement.classList.add("is-animated");
}

export function initPageLoader() {
  const loader = document.querySelector<HTMLElement>("[data-loader]");
  if (!loader) return;

  const alreadySeen = sessionStorage.getItem(LOADER_KEY) === "1";

  if (prefersReduced() || alreadySeen) {
    loader.remove();
    document.documentElement.classList.add("is-ready");
    return;
  }

  loader.hidden = false;
  loader.classList.add("is-active");
  loader.setAttribute("aria-hidden", "false");

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      sessionStorage.setItem(LOADER_KEY, "1");
      loader.setAttribute("aria-hidden", "true");
      loader.classList.add("is-done");
      document.documentElement.classList.add("is-ready");
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.55,
        ease: "power4.inOut",
        onComplete: () => loader.remove(),
      });
    },
  });

  // Short ceremonial intro (~0.9s) — does not gate content fetch; HTML is already present.
  tl.fromTo(
    "[data-loader-mark] span",
    { yPercent: 110 },
    { yPercent: 0, duration: 0.45, stagger: 0.05 },
  ).to(
    "[data-loader-bar]",
    { scaleX: 1, duration: 0.4, ease: "power2.inOut" },
    "-=0.1",
  );
}

export function initHeroAnimation() {
  if (prefersReduced()) {
    gsap.set("[data-hero-anim]", { clearProps: "all", opacity: 1, y: 0 });
    return;
  }

  const root = document.querySelector("[data-hero]");
  if (!root) return;

  const hasLoader = Boolean(document.querySelector("[data-loader].is-active"));

  gsap.fromTo(
    "[data-hero-anim]",
    { y: 28 },
    {
      y: 0,
      duration: 0.75,
      stagger: 0.07,
      ease: "power3.out",
      delay: hasLoader ? 0.85 : 0.08,
      clearProps: "transform",
    },
  );

  // Keep hero media at full frame from first paint — no clipPath flash after the loader.
  gsap.set("[data-hero-image]", { clearProps: "clipPath" });
}

export function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (!items.length) return;

  if (prefersReduced() || !document.documentElement.classList.contains("is-animated")) {
    items.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  items.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 28 },
      {
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
        onStart: () => el.classList.add("is-inview"),
        onComplete: () => {
          gsap.set(el, { clearProps: "transform" });
        },
      },
    );
  });
}

export function initProjectHovers() {
  if (prefersReduced()) return;

  document.querySelectorAll<HTMLElement>("[data-project-card]").forEach((card) => {
    const media = card.querySelector<HTMLElement>("[data-project-media]");
    if (!media) return;

    card.addEventListener("mouseenter", () => {
      gsap.to(media, { scale: 1.05, duration: 0.7, ease: "power3.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(media, { scale: 1, duration: 0.7, ease: "power3.out" });
    });
  });
}

export function initSiteAnimations() {
  enableMotionClasses();
  initPageLoader();
  initHeroAnimation();
  initReveals();
  initProjectHovers();
}

declare global {
  interface Window {
    __dcAnimInit?: boolean;
  }
}

if (typeof window !== "undefined") {
  const boot = () => {
    if (window.__dcAnimInit) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    }
    window.__dcAnimInit = true;
    initSiteAnimations();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  document.addEventListener("astro:page-load", boot);
}
