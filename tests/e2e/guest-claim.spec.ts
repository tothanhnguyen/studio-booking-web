import { expect, test } from "@playwright/test";

test("verified customer explicitly claims an eligible guest booking", async ({ context, page }, testInfo) => {
  // Fixed dates in this suite accumulate bookings run over run against the
  // shared, non-reset seeded database — 2027-07-05/06 filled to the room's
  // daily capacity from repeated prior runs, so this uses a fresh date pair.
  const date = testInfo.project.name === "mobile-chrome" ? "2028-01-16" : "2028-01-15";
  await page.goto("/services/photo-room-rental");
  await page.getByRole("link", { name: "Đặt lịch dịch vụ này" }).click();
  await page.getByLabel("Họ tên").fill("Khách Claim");
  await page.getByLabel("Email").fill("CUSTOMER-TEST@MowStudio.Local");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByLabel("Ngày đặt studio").fill(date);
  await page.getByRole("button", { name: "Xem giờ trống" }).click();
  await page.locator("button[aria-pressed]").first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Giữ chỗ 10 phút" }).click();
  await expect(page).toHaveURL(/\/booking\/[0-9a-f-]+\/payment$/);

  await context.addCookies([{ name: "mowstudio-test-role", value: "CUSTOMER", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/account/bookings");
  await page.getByRole("button", { name: "Nhận booking cũ" }).click();
  await expect(page.getByRole("status")).toContainText("Đã nhận 1 booking");
  await page.getByRole("link", { name: "Thuê phòng chụp ảnh" }).first().click();
  await expect(page.getByRole("heading", { name: "Chi tiết booking" })).toBeVisible();
});
