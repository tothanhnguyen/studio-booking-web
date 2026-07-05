import { expect, test } from "@playwright/test";

test.describe.serial("guest booking journey", () => {
  let privatePaymentPath = "";

  test("guest completes five steps and receives a private hold", async ({ page }, testInfo) => {
    const date = testInfo.project.name === "mobile-chrome" ? "2027-04-06" : "2027-04-05";
    await page.goto("/services/photo-room-rental");
    await page.getByRole("link", { name: "Đặt lịch dịch vụ này" }).click();
    await expect(page.getByRole("heading", { name: "Thông tin liên hệ" })).toBeVisible();
    await page.getByLabel("Họ tên").fill("Nguyễn Khách");
    await page.getByLabel("Email").fill(`guest-${testInfo.project.name}@example.com`);
    await page.getByLabel("Số điện thoại").fill("0900000000");
    await page.getByRole("button", { name: "Tiếp tục" }).click();

    await page.getByLabel("Ngày đặt studio").fill(date);
    await page.getByRole("button", { name: "Xem giờ trống" }).click();
    const availableTimes = page.locator('button[aria-pressed]');
    await expect(availableTimes.first()).toBeVisible();
    await availableTimes.first().click();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByText("Nguyễn Khách ·")).toBeVisible();

    await page.getByRole("button", { name: "Quay lại" }).click();
    if (await availableTimes.nth(1).isVisible()) await availableTimes.nth(1).click();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByText("Nguyễn Khách ·")).toBeVisible();
    await page.getByRole("button", { name: "Giữ chỗ 10 phút" }).click();

    await expect(page).toHaveURL(/\/booking\/[0-9a-f-]+\/payment$/);
    privatePaymentPath = new URL(page.url()).pathname;
    await expect(page.getByRole("timer")).toContainText("Giữ chỗ còn");
    await expect(page.getByText("Tiền cọc 30%")) .toBeVisible();
    expect(page.url()).not.toContain("token");
  });

  test("direct booking id access without the guest cookie is denied", async ({ page }) => {
    expect(privatePaymentPath).not.toBe("");
    const response = await page.goto(privatePaymentPath);
    expect(response?.status()).toBe(404);
  });
});
