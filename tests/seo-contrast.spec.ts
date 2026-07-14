import { expect, test, type Locator, type Page } from "@playwright/test";

function luminance(r: number, g: number, b: number) {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const R = toLin(r);
  const G = toLin(g);
  const B = toLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]) {
  const L1 = luminance(...fg);
  const L2 = luminance(...bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(input: string): [number, number, number] | null {
  const m = input.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

async function effectiveBackground(locator: Locator): Promise<[number, number, number]> {
  return locator.evaluate((el) => {
    let node: Element | null = el;
    while (node && node instanceof Element) {
      const bg = getComputedStyle(node).backgroundColor;
      const m = bg.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:,\s*([\d.]+))?/);
      if (m) {
        const alpha = m[4] === undefined ? 1 : Number(m[4]);
        if (alpha > 0.85) {
          return [Number(m[1]), Number(m[2]), Number(m[3])] as [number, number, number];
        }
      }
      node = node.parentElement;
    }
    return [238, 241, 239] as [number, number, number];
  });
}

async function assertReadable(locator: Locator, minRatio = 4.5) {
  await expect(locator).toBeVisible();
  const color = await locator.evaluate((el) => getComputedStyle(el).color);
  const opacity = Number(await locator.evaluate((el) => getComputedStyle(el).opacity));
  expect(opacity, `opacity for ${await locator.textContent()}`).toBeGreaterThan(0.9);

  const fg = parseRgb(color);
  expect(fg, `parse color ${color}`).not.toBeNull();
  const bg = await effectiveBackground(locator);
  const ratio = contrastRatio(fg!, bg);
  expect(
    ratio,
    `contrast ${ratio.toFixed(2)} for "${(await locator.textContent())?.trim()}" (${color} on rgb(${bg.join(",")}))`,
  ).toBeGreaterThanOrEqual(minRatio);
}

async function seedLoaderSeen(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("dc-loader-seen", "1");
  });
}

test.describe("Portfolio SEO + contrast", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoaderSeen(page);
  });

  test("home exposes crawlable heading and sky (no photo CTA)", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toContainText(/Danny/i);
    await expect(page.locator("[data-sky]")).toHaveCount(1);
    await expect(page.getByText(/Reemplaza con tu foto/i)).toHaveCount(0);

    // Static HTML should already include main keywords (SEO)
    const html = await page.content();
    expect(html).toMatch(/automatizaci[oó]n/i);
    expect(html).toContain('meta name="description"');
    expect(html).toMatch(/Danny Cen/i);
  });

  test("key texts keep WCAG AA contrast", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(900);

    await assertReadable(page.locator("h1").first(), 4.5);
    await assertReadable(page.locator(".hero__lead").first(), 4.5);
    await assertReadable(page.locator(".hero__eyebrow").first(), 4.5);
    await assertReadable(page.locator(".section-title").first(), 4.5);
    await assertReadable(page.locator(".section-lead").first(), 4.5);
    await assertReadable(page.locator(".section-label").first(), 4.5);
    await assertReadable(page.locator(".services__item p").first(), 4.5);
  });

  test("reveals keep text readable (no opacity hide)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    const hidden = await page.locator("[data-reveal]").evaluateAll((nodes) =>
      nodes.filter((n) => Number(getComputedStyle(n).opacity) < 0.9).length,
    );
    expect(hidden).toBe(0);
  });

  test("loader only shows once per session", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.removeItem("dc-loader-seen");
    });
    await page.goto("/");
    const first = page.locator("[data-loader]");
    // May appear briefly then remove
    await page.waitForTimeout(1400);
    await expect(page.locator("[data-loader].is-active")).toHaveCount(0);

    await page.reload();
    await page.waitForTimeout(400);
    await expect(page.locator("[data-loader].is-active")).toHaveCount(0);
  });

  test("about / portafolio / contact are indexable", async ({ page }) => {
    for (const path of ["/about", "/portafolio", "/contact", "/en", "/en/portafolio"]) {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      await assertReadable(page.locator("h1").first(), 4.5);
    }
  });

  test("portfolio index lists case studies", async ({ page }) => {
    await page.goto("/portafolio/");
    await expect(page.locator(".index__item")).toHaveCount(5);
    await expect(page.locator("a.index__link").first()).toBeVisible();
  });

  test("home shows portfolio carousel slides", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-carousel]")).toHaveCount(2);
    // Original slides only (clones for infinite loop are aria-hidden)
    await expect(
      page.locator("[data-carousel]").first().locator('.carousel__slide:not([aria-hidden="true"])'),
    ).toHaveCount(5);
  });
});
