import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "pixel-7", width: 412, height: 915 },
  { name: "ipad", width: 768, height: 1024 },
  { name: "ipad-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const KEY_PATHS = ["/", "/about/", "/portafolio/", "/blog/", "/contact/", "/en/"] as const;

async function seedLoaderSeen(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("dc-loader-seen", "1");
  });
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const clientW = doc.clientWidth;
    return {
      overflowPx: scrollW - clientW,
      scrollW,
      clientW,
    };
  });
  expect(
    overflow.overflowPx,
    `horizontal overflow ${overflow.overflowPx}px (${overflow.scrollW} vs ${overflow.clientW})`,
  ).toBeLessThanOrEqual(1);
}

test.describe("Responsive layouts", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoaderSeen(page);
  });

  for (const vp of VIEWPORTS) {
    test(`${vp.name} (${vp.width}×${vp.height}) — home + nav + no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("header, .site-header, [data-header]").first()).toBeVisible();
      await expect(page.locator("[data-carousel]").first()).toBeVisible();
      await assertNoHorizontalOverflow(page);

      // Carousel track should stay inside the viewport (transform carousel)
      const trackBox = await page.locator("[data-carousel]").first().boundingBox();
      expect(trackBox).toBeTruthy();
      expect(trackBox!.x).toBeGreaterThanOrEqual(-1);
      expect(trackBox!.x + trackBox!.width).toBeLessThanOrEqual(vp.width + 1);
    });
  }

  test("key routes render without overflow on phone and desktop", async ({ page }) => {
    for (const vp of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(vp);
      for (const path of KEY_PATHS) {
        await page.goto(path);
        await expect(page.locator("h1").first()).toBeVisible();
        await assertNoHorizontalOverflow(page);
      }
    }
  });

  test("portfolio grid columns adapt by breakpoint", async ({ page }) => {
    await page.goto("/portafolio/");

    await page.setViewportSize({ width: 390, height: 844 });
    let cols = await page.locator(".index").evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(1);

    await page.setViewportSize({ width: 800, height: 900 });
    cols = await page.locator(".index").evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(2);

    await page.setViewportSize({ width: 1200, height: 900 });
    cols = await page.locator(".index").evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(3);
  });
});
