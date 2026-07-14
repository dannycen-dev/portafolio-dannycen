/**
 * Persist preferred language and keep navigation inside that locale.
 * Preference is set when the user clicks EN/ES in the header.
 */
import { LANG_PREF_KEY } from "../i18n/utils";

function currentLangFromPath(pathname: string): "es" | "en" {
  return pathname.split("/").filter(Boolean)[0] === "en" ? "en" : "es";
}

function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en" || parts[0] === "es") parts.shift();
  return parts.join("/");
}

function localePath(lang: "es" | "en", path = ""): string {
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (lang === "es") return clean ? `/${clean}/` : "/";
  return clean ? `/en/${clean}/` : "/en/";
}

function bindLangSwitch() {
  document.querySelectorAll<HTMLAnchorElement>("[data-lang-switch]").forEach((link) => {
    link.onclick = () => {
      const next = link.dataset.langSwitch;
      if (next === "es" || next === "en") {
        try {
          localStorage.setItem(LANG_PREF_KEY, next);
        } catch {
          /* ignore */
        }
      }
    };
  });
}

function applyPreferredLangRedirect() {
  let pref: string | null = null;
  try {
    pref = localStorage.getItem(LANG_PREF_KEY);
  } catch {
    return;
  }
  if (pref !== "es" && pref !== "en") return;

  const current = currentLangFromPath(location.pathname);
  if (current === pref) return;

  // Only auto-correct when preference disagrees with URL (e.g. bookmarked /about while pref=en).
  const target = localePath(pref, stripLocale(location.pathname));
  if (target !== location.pathname) {
    location.replace(target);
  }
}

function boot() {
  bindLangSwitch();
  applyPreferredLangRedirect();
}

boot();
document.addEventListener("astro:page-load", boot);
