import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initPageLoader() {
  const loader = document.querySelector<HTMLElement>("[data-loader]");
  if (!loader) return;

  if (prefersReduced()) {
    loader.remove();
    document.documentElement.classList.add("is-ready");
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      loader.setAttribute("aria-hidden", "true");
      loader.classList.add("is-done");
      document.documentElement.classList.add("is-ready");
      setTimeout(() => loader.remove(), 700);
    },
  });

  tl.fromTo(
    "[data-loader-mark] span",
    { yPercent: 110 },
    { yPercent: 0, duration: 0.7, stagger: 0.08 },
  )
    .to("[data-loader-bar]", { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.2")
    .to(loader, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "+=0.15");
}

export function initHeroAnimation() {
  if (prefersReduced()) {
    gsap.set("[data-hero-anim]", { clearProps: "all", opacity: 1, y: 0 });
    return;
  }

  const root = document.querySelector("[data-hero]");
  if (!root) return;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    delay: document.querySelector("[data-loader]") ? 1.6 : 0.15,
  });

  tl.fromTo(
    "[data-hero-image]",
    { clipPath: "inset(100% 0 0 0)", scale: 1.08 },
    { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 1.25, ease: "power4.out" },
  )
    .from(
      "[data-hero-anim]",
      { y: 36, opacity: 0, duration: 0.85, stagger: 0.08 },
      "-=0.7",
    );
}

export function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (!items.length) return;

  if (prefersReduced()) {
    items.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  items.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
        onComplete: () => el.classList.add("is-inview"),
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
