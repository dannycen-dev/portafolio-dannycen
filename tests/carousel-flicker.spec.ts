import { test, expect } from "@playwright/test";

test("carousel wrap uses invisible transform reset (no scrollLeft teleports)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const result = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>("[data-carousel]");
    const track = root?.querySelector<HTMLElement>("[data-carousel-track]");
    const next = root?.querySelector<HTMLElement>("[data-carousel-next]");
    if (!root || !track || !next) return { error: "missing" as const };

    // Must not be using scroll-based looping anymore
    const scrollLeftStart = track.scrollLeft;
    next.click();
    await new Promise((r) => setTimeout(r, 600));
    const scrollLeftAfter = track.scrollLeft;

    const totalOriginal =
      track.querySelectorAll('.carousel__slide:not([aria-hidden="true"])').length ||
      Math.round(track.querySelectorAll(".carousel__slide").length / 2);

    // Force a wrap across the last → first boundary
    for (let i = 0; i < totalOriginal + 1; i++) {
      next.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    return {
      cloned: track.dataset.cloned === "1",
      scrollLeftStart,
      scrollLeftAfter,
      slideCount: track.querySelectorAll(".carousel__slide").length,
      transform: getComputedStyle(track).transform,
    };
  });

  expect(result.error).toBeUndefined();
  expect(result.cloned).toBe(true);
  // Overflow track no longer scrolls — motion is transform-only
  expect(result.scrollLeftStart).toBe(0);
  expect(result.scrollLeftAfter).toBe(0);
  expect(result.transform).not.toBe("none");
});
