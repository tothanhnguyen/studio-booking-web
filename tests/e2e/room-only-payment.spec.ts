import { expect, test } from "@playwright/test";

import { signedWebhookHeaders } from "../fixtures/sepay-signature";

test("room-only booking is auto-confirmed after successful payment webhook", async ({ page }, testInfo) => {
  // Fixed dates in this suite accumulate CONFIRMED bookings run over run (this
  // path auto-confirms via webhook and never cancels) against the shared,
  // non-reset seeded database — 2027-04-07/08 filled to the room's daily
  // capacity from repeated prior runs, so this uses a fresh date pair.
  const date = testInfo.project.name === "mobile-chrome" ? "2027-09-02" : "2027-09-01";

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
  await expect(page.getByRole("heading", { name: "Thanh toán tiền cọc" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Mã VietQR thanh toán tiền cọc" })).toBeVisible();
  await expect(page.getByText(new RegExp(bookingId, "i"))).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sao chép Nội dung chuyển khoản" }),
  ).toBeVisible();
  await expect(page.getByText("Trạng thái booking:")).toBeVisible();
  await expect(page.getByText("Chờ thanh toán", { exact: true })).toBeVisible();
  await expect(page.getByText("Đang chờ", { exact: true })).toBeVisible();

  const webhookBody = JSON.stringify({
    // Event id must be unique per booking (not just per browser project): the
    // SePay webhook handler is idempotent on (provider, eventId), and this
    // suite runs repeatedly against a persistent, non-reset database. A
    // fixed id collides with leftover PaymentEvent rows from earlier runs,
    // so the webhook is silently treated as a duplicate and the booking
    // never transitions to PAID/CONFIRMED.
    id: `evt-e2e-room-only-${bookingId}`,
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

  await page.getByRole("link", { name: "Xem xác nhận" }).click();
  await expect(page).toHaveURL(`/booking/${bookingId}/confirmation`);
  await expect(page.getByRole("heading", { name: "Đã nhận tiền cọc." })).toBeVisible();
  await expect(page.getByText("Trạng thái booking:")).toBeVisible();
  await expect(page.getByText("Đã xác nhận", { exact: true })).toBeVisible();
  await expect(page.getByText("Đã thanh toán", { exact: true })).toBeVisible();
});
