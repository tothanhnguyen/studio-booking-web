import { expect, test } from "@playwright/test";

test("guest discovers a service from home through the studio catalog", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 0.75)));
  await page.getByRole("link", { name: "Xem không gian" }).click();
  await expect(page).toHaveURL(/\/studios$/);
  await expect(page.getByRole("heading", { name: "Photo Studio" })).toBeVisible();
  await expect(page.locator("article[data-room-slug]")).toHaveCount(3);

  for (const room of [
    { name: "Photo Studio", slug: "photo-studio" },
    { name: "Voice/Podcast Booth", slug: "voice-podcast-booth" },
    { name: "Music Studio", slug: "music-studio" },
  ]) {
    await expect(page.getByRole("img", { name: new RegExp(room.name) }).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: `Khám phá ${room.name}` }),
    ).toHaveAttribute("href", `/studios/${room.slug}`);
  }

  await page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Photo Studio" }) })
    .getByRole("link", { name: "Khám phá Photo Studio" })
    .click();

  await expect(page).toHaveURL(/\/studios\/photo-studio$/);
  await expect(page.getByTestId("room-visual").first()).toBeVisible();
  await page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Thuê phòng chụp ảnh" }) })
    .getByRole("link", { name: "Xem dịch vụ" })
    .click();

  await expect(page).toHaveURL(/\/services\/photo-room-rental$/);
  await expect(page.getByText("120 phút", { exact: true })).toBeVisible();
  await expect(page.getByText(/800\.000\s*₫/)).toBeVisible();
  await expect(page.getByText("Cọc 30% khi giữ lịch", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Đặt lịch dịch vụ này" })).toHaveAttribute(
    "href",
    /^\/booking\//,
  );
});

test("invalid public catalog slug returns the not-found page", async ({ page }) => {
  const response = await page.goto("/services/khong-ton-tai");

  expect(response?.status()).toBe(404);
});
