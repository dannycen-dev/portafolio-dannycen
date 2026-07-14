import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const portafolio = defineCollection({
  loader: glob({ base: "./src/content/portafolio", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    role: z.string(),
    client: z.string(),
    studio: z.string().default("Idea2Form / Idris Aguero"),
    url: z.string().url(),
    cover: z.string(),
    tags: z.array(z.string()),
    accent: z.string(),
    featured: z.boolean().default(true),
    order: z.number().default(99),
    year: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    accent: z.string(),
    category: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { portafolio, blog };
