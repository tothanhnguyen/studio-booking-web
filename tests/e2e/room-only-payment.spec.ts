import { expect, test } from "@playwright/test";

import { signedWebhookHeaders } from "../fixtures/sepay-signature";

test("room-only booking is auto-confirmed after successful payment webhook", async ({ page }, testInfo) => {
  const date = testInfo.project.name === "mobile-chrome" ? "2027-04-08" : "2027-04-07";

  await page.goto("/services/photo-room-rental");
  await page.getByRole("link", { name: "Đặt lịch dịch vụ này" }).click();
  await page.getByLabel("Họ tên").fill("Khách Room Only");
  await page.getByLabel("Email").fill(`room-only-${testInfo.project.name}@example.com`);
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByLabel("Ngày đặt studio").fill(date);
  await page.getByRole("button", { name: "Xem giờ trống" }).click();
  await page.locator("button[aria-pressed]").first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Giữ chỗ 10 phút" }).click();

  await expect(page).toHaveURL(/\/booking\/[0-9a-f-]+\/payment$/);
  const bookingId = new URL(page.url()).pathname.split("/")[2]!;

  const webhookBody = JSON.stringify({
    id: `evt-e2e-room-only-${testInfo.project.name}`,
    amount: 240000,
    currency: "VND",
    content: `Thanh toan coc BOOKING:${bookingId}`,
    occurred_at: "2026-07-06T02:00:00.000Z",
  });
  const webhookResponse = await page.request.post("/api/payments/sepay/webhook", {
    headers: signedWebhookHeaders(webhookBody),
    data: webhookBody,
  });
  expect(webhookResponse.ok()).toBeTruthy();

  await page.goto(`/booking/${bookingId}/confirmation`);
  await expect(page.getByText("Trạng thái booking:")).toBeVisible();
  await expect(page.getByText("CONFIRMED")).toBeVisible();
  await expect(page.getByText("Trạng thái thanh toán:")).toBeVisible();
  await expect(page.getByText("PAID")).toBeVisible();
});
