import { expect, test, type Page } from "@playwright/test";

async function seedLoaderSeen(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("dc-loader-seen", "1");
  });
}

async function nextBookableDayButton(page: Page) {
  // Prefer a weekday day button that is enabled inside the open booking dialog
  const dialog = page.locator("dialog[data-modal='booking']");
  const days = dialog.locator("[data-booking-grid] button[data-date]:not(:disabled)");
  await expect(days.first()).toBeVisible();
  return days.first();
}

test.describe("Booking modal flow", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoaderSeen(page);
  });

  test("selecting a day reveals time slots", async ({ page }) => {
    await page.goto("/contact/");
    await page.getByRole("button", { name: /Agendar cita|Book a call/i }).click();

    const dialog = page.locator("dialog[data-modal='booking']");
    await expect(dialog).toBeVisible();

    const slotsWrap = dialog.locator("[data-booking-slots-wrap]");
    await expect(slotsWrap).not.toHaveClass(/is-open/);

    await (await nextBookableDayButton(page)).click();

    await expect(slotsWrap).toHaveClass(/is-open/);
    const slotButtons = dialog.locator("[data-booking-slots] button");
    await expect(slotButtons.first()).toBeVisible();
    expect(await slotButtons.count()).toBeGreaterThan(0);

    // Hours must be readable (not stuck at opacity 0)
    const opacity = await dialog.locator("[data-booking-slots] button").first().evaluate((el) => {
      return Number(getComputedStyle(el).opacity);
    });
    expect(opacity).toBeGreaterThan(0.9);
  });

  test("selecting a time reveals guest fields and enables confirm", async ({ page }) => {
    await page.goto("/contact/");
    await page.getByRole("button", { name: /Agendar cita|Book a call/i }).click();

    const dialog = page.locator("dialog[data-modal='booking']");
    await (await nextBookableDayButton(page)).click();
    await dialog.locator("[data-booking-slots] button").first().click();

    const guest = dialog.locator("[data-booking-guest]");
    await expect(guest).toHaveClass(/is-open/);
    await expect(dialog.locator("[data-booking-name]")).toBeVisible();
    await expect(dialog.locator("[data-booking-phone]")).toBeVisible();

    const confirm = dialog.locator("[data-booking-confirm]");
    await expect(confirm).toBeDisabled();

    await dialog.locator("[data-booking-name]").fill("Ana Pérez");
    await dialog.locator("[data-booking-phone]").fill("+52 999 111 2233");
    await expect(confirm).toBeEnabled();
  });
});
