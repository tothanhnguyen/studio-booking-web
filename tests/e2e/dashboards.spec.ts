import { expect, test } from "@playwright/test";

test("guest account history requires authentication", async ({ page }) => {
  await page.goto("/account/bookings");
  await expect(page).toHaveURL(/\/login\?next=\/account\/bookings$/);
});

test("customer cannot access another booking by direct id or admin queries", async ({ context, page }, testInfo) => {
  const date = testInfo.project.name === "mobile-chrome" ? "2027-07-08" : "2027-07-07";
  await page.goto("/services/podcast-booth-rental");
  await page.getByRole("link", { name: "Đặt lịch dịch vụ này" }).click();
  await page.getByLabel("Họ tên").fill("Khách Khác");
  await page.getByLabel("Email").fill(`other-${testInfo.project.name}@example.com`);
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByLabel("Ngày đặt studio").fill(date);
  await page.getByRole("button", { name: "Xem giờ trống" }).click();
  await page.locator("button[aria-pressed]").first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Giữ chỗ 10 phút" }).click();
  const bookingId = new URL(page.url()).pathname.split("/")[2]!;

  await context.addCookies([{ name: "mowstudio-test-role", value: "CUSTOMER", domain: "127.0.0.1", path: "/" }]);
  const detailResponse = await page.goto(`/account/bookings/${bookingId}`);
  expect(detailResponse?.status()).toBe(404);
  const adminResponse = await page.goto("/admin/bookings");
  expect(adminResponse?.status()).toBe(404);
});

test("admin can use booking list, calendar and detail", async ({ context, page }) => {
  await context.addCookies([{ name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/admin/bookings");
  await expect(page.getByRole("heading", { name: "Quản lý booking" })).toBeVisible();
  const firstBooking = page.locator("ul a").first();
  if (await firstBooking.count()) {
    await firstBooking.click();
    await expect(page.getByRole("heading", { name: "Chi tiết booking" })).toBeVisible();
  }
  await page.goto("/admin/bookings/calendar?from=2027-07-01&to=2027-07-31");
  await expect(page.getByRole("heading", { name: "Lịch booking" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Xem lịch" })).toBeVisible();
});
