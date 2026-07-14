import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "./utils";
import { portfolioSlug } from "./utils";

function entryLang(id: string): Lang | null {
  const normalized = id.replace(/\\/g, "/");
  if (normalized.startsWith("es/") || normalized.includes("/es/")) return "es";
  if (normalized.startsWith("en/") || normalized.includes("/en/")) return "en";
  return null;
}

export async function getBlogPosts(lang: Lang): Promise<CollectionEntry<"blog">[]> {
  const all = await getCollection("blog");
  return all
    .filter((entry) => entryLang(entry.id) === lang && entry.data.draft !== true)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getRecentBlogPosts(lang: Lang, limit = 6) {
  return (await getBlogPosts(lang)).slice(0, limit);
}

export function blogSlug(entryId: string): string {
  return portfolioSlug(entryId);
}
