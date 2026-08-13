import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, processPaymentEvent } = vi.hoisted(() => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
    },
  },
  processPaymentEvent: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ prisma }));
vi.mock("@/lib/env/server", () => ({
  serverEnv: { PAYMENT_MODE: "demo" },
}));
vi.mock("@/features/payment/application/process-payment-event", () => ({
  processPaymentEvent,
}));

import { ForbiddenError, UnauthenticatedError } from "@/features/auth/application/require-role";
import { simulateDemoPayment } from "./simulate-demo-payment";

describe("simulate-demo-payment", () => {
  beforeEach(() => {
    prisma.booking.findUnique.mockReset();
    processPaymentEvent.mockReset();
  });

  it("requires an authenticated admin", async () => {
    await expect(simulateDemoPayment(null, "booking-1")).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
    await expect(
      simulateDemoPayment({ id: "customer", role: "CUSTOMER" }, "booking-1"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("sends the deposit through the normalized payment pipeline", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      paymentStatus: "PENDING",
      depositAmount: 240_000,
      currency: "VND",
    });
    processPaymentEvent.mockResolvedValue({
      status: "PROCESSED",
      bookingId: "booking-1",
      decision: "SETTLED",
      latePaymentReview: false,
    });

    await expect(
      simulateDemoPayment({ id: "admin", role: "ADMIN" }, "booking-1"),
    ).resolves.toMatchObject({ status: "PROCESSED", decision: "SETTLED" });
    expect(processPaymentEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "SEPAY",
        bookingReference: "booking-1",
        amount: 240_000,
        currency: "VND",
        metadata: { transferContent: "BOOKING:booking-1", payerAccount: "demo" },
      }),
    );
  });

  it("does not replay a booking that is already paid", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      paymentStatus: "PAID",
      depositAmount: 240_000,
      currency: "VND",
    });

    await expect(
      simulateDemoPayment({ id: "admin", role: "ADMIN" }, "booking-1"),
    ).rejects.toThrow(/đã được xác nhận thanh toán/);
    expect(processPaymentEvent).not.toHaveBeenCalled();
  });
});
