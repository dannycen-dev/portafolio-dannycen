#!/usr/bin/env node
/**
 * Cloudflare Pages "Output directory" is often left as `dist`.
 * Astro's Cloudflare adapter writes the browsable site to dist/client.
 * Copy those files to dist/ root (and dist/pages) so Git builds serve index.html.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const client = join(root, "dist", "client");
const pages = join(root, "dist", "pages");
const dist = join(root, "dist");

if (!existsSync(join(client, "index.html"))) {
  console.error("prepare-pages: dist/client/index.html missing — run astro build first");
  process.exit(1);
}

// Flat copy for Output directory = dist (keeps dist/client + dist/server intact)
for (const name of readdirSync(client)) {
  if (name === "client" || name === "server" || name === "pages") continue;
  const from = join(client, name);
  const to = join(dist, name);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

// Also expose dist/pages for Output directory = dist/pages
rmSync(pages, { recursive: true, force: true });
mkdirSync(pages, { recursive: true });
cpSync(client, pages, { recursive: true });

if (!existsSync(join(dist, "index.html"))) {
  console.error("prepare-pages: failed to place dist/index.html");
  process.exit(1);
}

const top = readdirSync(dist).filter((n) => {
  try {
    return !statSync(join(dist, n)).isDirectory() || n === "_astro";
  } catch {
    return false;
  }
});
console.log("prepare-pages: dist/ and dist/pages ready", top.slice(0, 8).join(", "));
