import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "./utils";
import { portfolioSlug } from "./utils";

function entryLang(id: string): Lang | null {
  const normalized = id.replace(/\\/g, "/");
  if (normalized.startsWith("es/") || normalized.includes("/es/")) return "es";
  if (normalized.startsWith("en/") || normalized.includes("/en/")) return "en";
  return null;
}

export async function getPortfolio(lang: Lang): Promise<CollectionEntry<"portafolio">[]> {
  const all = await getCollection("portafolio");
  return all
    .filter((entry) => entryLang(entry.id) === lang)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getPortfolioEntry(lang: Lang, slug: string) {
  const entries = await getPortfolio(lang);
  return entries.find((entry) => portfolioSlug(entry.id) === slug);
}

export { portfolioSlug };
