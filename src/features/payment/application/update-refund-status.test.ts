import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = {
  booking: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/db/prisma", () => ({ prisma }));

import { updateRefundStatus } from "@/features/payment/application/update-refund-status";

describe("update-refund-status", () => {
  beforeEach(() => {
    prisma.booking.findUnique.mockReset();
    prisma.booking.update.mockReset();
  });

  it("allows admin transition REQUESTED -> PROCESSING", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      refundStatus: "REQUESTED",
      cancellationReason: null,
    });
    prisma.booking.update.mockResolvedValue({});

    await updateRefundStatus(
      { id: "admin", role: "ADMIN", emailVerified: true },
      "booking-1",
      "PROCESSING",
      "Đang đối soát",
    );

    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ refundStatus: "PROCESSING" }),
      }),
    );
  });
});
