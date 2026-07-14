#!/usr/bin/env node
/**
 * Cloudflare Pages (static upload) expects the site root in the configured
 * Output directory. Astro's Cloudflare adapter writes HTML to dist/client.
 * This copies that tree to dist/pages so the dashboard can use `dist/pages`
 * without conflicting with Worker assets in dist/client.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const client = join(process.cwd(), "dist", "client");
const pages = join(process.cwd(), "dist", "pages");

if (!existsSync(join(client, "index.html"))) {
  console.error("prepare-pages: dist/client/index.html missing — run astro build first");
  process.exit(1);
}

rmSync(pages, { recursive: true, force: true });
mkdirSync(pages, { recursive: true });
cpSync(client, pages, { recursive: true });
console.log("prepare-pages: ready at dist/pages");
