import { expect, test, type Page } from "@playwright/test";

const INTERNAL = (href: string) =>
  href.startsWith("/") || href.includes("127.0.0.1") || href.includes("localhost");

async function seedLoaderSeen(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("dc-loader-seen", "1");
  });
}

async function collectInternalHrefs(page: Page): Promise<string[]> {
  const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors
      .map((a) => (a as HTMLAnchorElement).getAttribute("href") || "")
      .filter(Boolean),
  );
  const out = new Set<string>();
  for (const href of hrefs) {
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;
    if (/^https?:/i.test(href) && !INTERNAL(href)) continue;
    try {
      const url = new URL(href, page.url());
      out.add(url.pathname.endsWith("/") || url.pathname.includes(".") ? url.pathname : `${url.pathname}/`);
    } catch {
      /* skip bad urls */
    }
  }
  return [...out];
}

test.describe("SEO + indexing", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoaderSeen(page);
  });

  test("home has core SEO tags for Google/Bing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,\s*follow/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /dannycen\.dev|127\.0\.0\.1/);
    await expect(page.locator('link[rel="alternate"][hreflang="es-MX"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  });

  test("robots.txt and sitemap are published", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsText = await robots.text();
    expect(robotsText).toMatch(/Sitemap:\s*https:\/\/dannycen\.dev\/sitemap-index\.xml/i);
    expect(robotsText).toMatch(/Allow:\s*\//);
    expect(robotsText).toMatch(/User-agent:\s*GPTBot/i);
    expect(robotsText).toMatch(/User-agent:\s*ClaudeBot/i);
    expect(robotsText).toMatch(/User-agent:\s*Google-Extended/i);
    expect(robotsText).toMatch(/User-agent:\s*OAI-SearchBot/i);
    expect(robotsText).toMatch(/User-agent:\s*Claude-SearchBot/i);

    const sitemap = await request.get("/sitemap-index.xml");
    expect(sitemap.status(), await sitemap.text()).toBe(200);
    const map = await sitemap.text();
    expect(map).toMatch(/sitemap/i);
  });

  test("llms.txt map is published for AI crawlers", async ({ request, page }) => {
    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    expect(llms.headers()["content-type"] || "").toMatch(/text\/plain|octet-stream/i);
    const body = await llms.text();
    expect(body).toMatch(/^# Danny Cen/m);
    expect(body).toMatch(/^>/m);
    expect(body).toContain("https://dannydev.space/about/");
    expect(body).toContain("https://dannydev.space/portafolio/");
    expect(body).toContain("https://dannydev.space/llms-full.txt");

    const full = await request.get("/llms-full.txt");
    expect(full.status()).toBe(200);
    const fullBody = await full.text();
    expect(fullBody).toMatch(/Danny Cen/i);
    expect(fullBody).toMatch(/Mérida|Merida/i);
    expect(fullBody).toMatch(/Kommo/i);

    await page.goto("/");
    await expect(page.locator('link[rel="alternate"][title="llms.txt"]')).toHaveAttribute(
      "href",
      "/llms.txt",
    );
  });
});

test.describe("Language switch persistence", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoaderSeen(page);
  });

  test("EN switch keeps locale across nav pages", async ({ page }) => {
    await page.goto("/");

    // Mobile hamburger: open nav before switching language
    const toggle = page.locator("[data-nav-toggle]");
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(page.locator("[data-nav]")).toHaveClass(/is-open/);
    }

    await page.locator("[data-lang-switch='en']").click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const openNavIfNeeded = async () => {
      if (await toggle.isVisible()) {
        const nav = page.locator("[data-nav]");
        if (!(await nav.evaluate((el) => el.classList.contains("is-open")))) {
          await toggle.click();
        }
      }
    };

    await openNavIfNeeded();
    await page.locator("#site-nav").getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/about\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    await openNavIfNeeded();
    await page.locator("#site-nav").getByRole("link", { name: "Portfolio", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/portafolio\/?$/);

    await openNavIfNeeded();
    await page.locator("#site-nav").getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/blog\/?$/);

    await openNavIfNeeded();
    await page.locator("#site-nav").getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/contact\/?$/);

    // Preference restores EN if user lands on Spanish URL
    await page.goto("/about/");
    await expect(page).toHaveURL(/\/en\/about\/?$/);
  });

  test("ES switch restores Spanish locale", async ({ page }) => {
    await page.goto("/en/");
    const toggle = page.locator("[data-nav-toggle]");
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(page.locator("[data-nav]")).toHaveClass(/is-open/);
    }
    await page.locator("[data-lang-switch='es']").click();
    await expect(page).toHaveURL(/\/$/);
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    await page.locator("#site-nav").getByRole("link", { name: "Sobre mí", exact: true }).click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  });
});

test.describe("Links & buttons crawl", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoaderSeen(page);
  });

  test("all internal links from key pages resolve (ES + EN)", async ({ page, request }) => {
    const seeds = ["/", "/about/", "/portafolio/", "/blog/", "/contact/", "/en/", "/en/about/", "/en/portafolio/", "/en/blog/", "/en/contact/"];
    const seen = new Set<string>();
    const queue = [...seeds];
    const broken: string[] = [];

    while (queue.length && seen.size < 80) {
      const path = queue.shift()!;
      if (seen.has(path)) continue;
      seen.add(path);

      const res = await request.get(path);
      if (!res.ok() && res.status() !== 301 && res.status() !== 302) {
        broken.push(`${path} → ${res.status()}`);
        continue;
      }

      await page.goto(path);
      const hrefs = await collectInternalHrefs(page);
      for (const href of hrefs) {
        if (!seen.has(href) && !href.includes("/projects")) queue.push(href);
      }
    }

    await page.goto("/");
    await expect(page.getByRole("link", { name: /Trabajemos juntos|Let's work together/i }).first()).toBeVisible();
    await page.goto("/en/");
    await expect(page.getByRole("link", { name: /Let's work together/i }).first()).toBeVisible();

    expect(broken, broken.join("\n")).toEqual([]);
    expect(seen.size).toBeGreaterThan(15);
  });

  test("portfolio and blog case links open detail pages", async ({ page }) => {
    await page.goto("/portafolio/");
    const firstCase = page.locator("a.index__link").first();
    await expect(firstCase).toBeVisible();
    await firstCase.click();
    await expect(page).toHaveURL(/\/portafolio\/[^/]+\/?$/);
    await expect(page.locator("h1").first()).toBeVisible();

    await page.goto("/blog/");
    const firstPost = page.locator("a.blog__link").first();
    await expect(firstPost).toBeVisible();
    await firstPost.click();
    await expect(page).toHaveURL(/\/blog\/[^/]+\/?$/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("external profile links are well-formed", async ({ page }) => {
    await page.goto("/contact/");
    await expect(page.getByRole("button", { name: /Agendar cita|Book a call/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Enviar mensaje|Send a message/i })).toBeVisible();

    await page.getByRole("button", { name: /Agendar cita|Book a call/i }).click();
    await expect(page.locator("dialog[data-modal='booking']")).toBeVisible();
    await expect(page.locator("[data-booking]")).toBeVisible();
    await page.locator("dialog[data-modal='booking'] [data-modal-close]").click();

    await page.getByRole("button", { name: /Enviar mensaje|Send a message/i }).click();
    await expect(page.locator("dialog[data-modal='message']")).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });
});
