// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Fixed local port for this project — never hop to another port. */
export const DEV_PORT = 4329;

/**
 * Keep a public/ mirror of generated sitemaps so static hosts and
 * `astro preview` always treat them as copied assets (same as robots.txt).
 */
function mirrorSitemapToPublic() {
  return {
    name: "mirror-sitemap-to-public",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const publicDir = fileURLToPath(new URL("./public", import.meta.url));
        // Cloudflare adapter may place assets under dist/client
        const candidates = [
          outDir,
          join(outDir, "client"),
          fileURLToPath(new URL("./dist/client", import.meta.url)),
        ];
        for (const name of ["sitemap-index.xml", "sitemap-0.xml"]) {
          for (const base of candidates) {
            const src = join(base, name);
            if (existsSync(src)) {
              copyFileSync(src, join(publicDir, name));
              break;
            }
          }
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://dannydev.space",
  prefetch: true,
  trailingSlash: "always",
  adapter: cloudflare({
    imageService: "compile",
    // Content collections / MDX prerender use Node APIs at build time.
    prerenderEnvironment: "node",
  }),
  server: {
    host: "127.0.0.1",
    port: DEV_PORT,
    strictPort: true,
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-MX",
          en: "en-US",
        },
      },
      filter: (page) => !page.includes("/projects") && !page.includes("/api/"),
    }),
    mirrorSitemapToPublic(),
  ],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
