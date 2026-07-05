import { expect, test } from "@playwright/test";

test("admin updates working hours and manages a blocked slot", async ({ context, page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Schedule mutation runs once.");
  await context.addCookies([{ name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/admin/schedule");

  const scheduleForm = page.getByRole("heading", { name: "Giờ làm việc" }).locator("xpath=ancestor::form");
  await scheduleForm.getByLabel("Thứ trong tuần").selectOption("1");
  await scheduleForm.getByLabel("Các khung giờ").fill("09:00-12:00,13:00-18:00");
  await scheduleForm.getByRole("button", { name: "Lưu giờ làm việc" }).click();
  await expect(scheduleForm.getByRole("status")).toHaveText("Đã cập nhật giờ làm việc.");

  const reason = `E2E bảo trì ${Date.now()}`;
  const blockedForm = page.getByRole("heading", { name: "Chặn khung giờ" }).locator("xpath=ancestor::form");
  await blockedForm.getByLabel("Bắt đầu").fill("2027-01-15T10:00");
  await blockedForm.getByLabel("Kết thúc").fill("2027-01-15T11:00");
  await blockedForm.getByLabel("Lý do").fill(reason);
  await blockedForm.getByRole("button", { name: "Chặn lịch" }).click();
  await expect(blockedForm.getByRole("status")).toHaveText("Đã chặn khung giờ.");

  await page.goto("/admin/blocked-slots");
  const blockedCard = page.getByRole("article").filter({ hasText: reason });
  await expect(blockedCard).toBeVisible();
  await blockedCard.getByRole("button", { name: "Xóa block" }).click();
  await expect(blockedCard).toHaveCount(0);
});
