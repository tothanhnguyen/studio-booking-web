import { expect, test } from "@playwright/test";

test.describe("assisted booking lifecycle", () => {
  test("ASSISTED booking transitions: PENDING_PAYMENT → PENDING (paid) → CONFIRMED (admin)", async ({
    context,
    page,
  }, testInfo) => {
    const date = testInfo.project.name === "mobile-chrome" ? "2027-05-06" : "2027-05-05";

    // Step 1: Guest creates an ASSISTED booking
    await page.goto("/services/assisted-photo-session");
    await page.getByRole("link", { name: "Đặt lịch dịch vụ này" }).click();
    await page.getByLabel("Họ tên").fill("Khách Assisted");
    await page.getByLabel("Email").fill(`assisted-${testInfo.project.name}@example.com`);
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await page.getByLabel("Ngày đặt studio").fill(date);
    await page.getByRole("button", { name: "Xem giờ trống" }).click();
    await page.locator("button[aria-pressed]").first().click();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await page.getByRole("button", { name: "Giữ chỗ 10 phút" }).click();

    await expect(page).toHaveURL(/\/booking\/[0-9a-f-]+\/payment$/);
    const bookingId = new URL(page.url()).pathname.split("/")[2]!;

    // Step 2: Simulate SePay payment webhook (deposit = 30% of 1,200,000 = 360,000 VND)
    const webhookResponse = await page.request.post("/api/payments/sepay/webhook", {
      data: {
        id: `evt-e2e-assisted-${testInfo.project.name}`,
        amount: 360000,
        currency: "VND",
        content: `Thanh toan coc BOOKING:${bookingId}`,
        occurred_at: "2026-07-06T03:00:00.000Z",
      },
    });
    expect(webhookResponse.ok()).toBeTruthy();
    const webhookBody = await webhookResponse.json();
    expect(webhookBody.data.status).toBe("PROCESSED");
    expect(webhookBody.data.decision).toBe("SETTLED");

    // Step 3: Verify ASSISTED booking transitions to PENDING (not CONFIRMED like ROOM_ONLY)
    await page.goto(`/booking/${bookingId}/confirmation`);
    await expect(page.getByText("Trạng thái booking:")).toBeVisible();
    await expect(page.getByText("PENDING")).toBeVisible();
    await expect(page.getByText("Trạng thái thanh toán:")).toBeVisible();
    await expect(page.getByText("PAID")).toBeVisible();

    // Step 4: Admin confirms the ASSISTED booking
    await context.addCookies([
      { name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
    ]);
    await page.goto(`/admin/bookings/${bookingId}`);
    await expect(page.getByRole("heading", { name: "Chi tiết booking" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Xác nhận booking ASSISTED" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Xác nhận booking ASSISTED" }).click();

    // Step 5: Verify booking is now CONFIRMED
    await page.waitForURL(`/admin/bookings/${bookingId}`);
    await expect(page.getByText("CONFIRMED")).toBeVisible();
  });

  test("admin can reject ASSISTED booking", async ({ context, page }, testInfo) => {
    const date = testInfo.project.name === "mobile-chrome" ? "2027-06-04" : "2027-06-03";

    // Guest creates ASSISTED booking
    await page.goto("/services/assisted-photo-session");
    await page.getByRole("link", { name: "Đặt lịch dịch vụ này" }).click();
    await page.getByLabel("Họ tên").fill("Khách Reject");
    await page.getByLabel("Email").fill(`reject-${testInfo.project.name}@example.com`);
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await page.getByLabel("Ngày đặt studio").fill(date);
    await page.getByRole("button", { name: "Xem giờ trống" }).click();
    await page.locator("button[aria-pressed]").first().click();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await page.getByRole("button", { name: "Giữ chỗ 10 phút" }).click();

    const bookingId = new URL(page.url()).pathname.split("/")[2]!;

    // Pay deposit
    const webhookResponse = await page.request.post("/api/payments/sepay/webhook", {
      data: {
        id: `evt-e2e-reject-${testInfo.project.name}`,
        amount: 360000,
        currency: "VND",
        content: `Thanh toan coc BOOKING:${bookingId}`,
        occurred_at: "2026-07-06T04:00:00.000Z",
      },
    });
    expect(webhookResponse.ok()).toBeTruthy();

    // Admin rejects the booking with reason
    await context.addCookies([
      { name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
    ]);
    await page.goto(`/admin/bookings/${bookingId}`);
    await expect(page.getByRole("heading", { name: "Chi tiết booking" })).toBeVisible();
    await page.getByLabel("Lý do hủy / từ chối").fill("Không đủ kỹ thuật viên");
    await page.getByRole("button", { name: "Từ chối booking" }).click();

    // Verify booking is CANCELLED with refund requested
    await page.waitForURL(`/admin/bookings/${bookingId}`);
    await expect(page.getByText("CANCELLED")).toBeVisible();
    await expect(page.getByText("REQUESTED")).toBeVisible();
  });
});
