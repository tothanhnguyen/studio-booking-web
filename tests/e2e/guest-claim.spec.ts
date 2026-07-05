import { expect, test } from "@playwright/test";

test("verified customer explicitly claims an eligible guest booking", async ({ context, page }, testInfo) => {
  const date = testInfo.project.name === "mobile-chrome" ? "2027-07-06" : "2027-07-05";
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
