export const languages = {
  es: "Español",
  en: "English",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "es";
export const LANG_PREF_KEY = "dc-lang-pref";

export function getLangFromUrl(url: URL): Lang {
  const segment = url.pathname.split("/").filter(Boolean)[0];
  if (segment === "en") return "en";
  return "es";
}

/** Build a locale-aware path. Pass path without leading slash ('' for home). */
export function localePath(lang: Lang, path = ""): string {
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (lang === "es") return clean ? `/${clean}/` : "/";
  return clean ? `/en/${clean}/` : "/en/";
}

/** Strip locale prefix from a pathname. */
export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en" || parts[0] === "es") parts.shift();
  return parts.join("/");
}

/** Same content path in the other language. */
export function switchLangPath(url: URL, next: Lang): string {
  return localePath(next, stripLocale(url.pathname));
}

/** Absolute alternate URLs for hreflang. */
export function alternateUrls(pathname: string, site = "https://dannydev.space") {
  const path = stripLocale(pathname);
  return {
    es: new URL(localePath("es", path), site).href,
    en: new URL(localePath("en", path), site).href,
  };
}

export function portfolioSlug(entryId: string): string {
  // ids look like "es/epa-community-archive" or "en/epa-community-archive"
  return entryId.includes("/") ? entryId.split("/").pop()! : entryId;
}
