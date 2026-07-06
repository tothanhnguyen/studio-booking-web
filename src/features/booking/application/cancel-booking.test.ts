import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = {
  booking: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/db/prisma", () => ({ prisma }));
vi.mock("@/features/notification/application/notification-service", () => ({
  sendBookingNotification: vi.fn(),
}));

import { cancelBooking } from "@/features/booking/application/cancel-booking";

describe("cancel-booking", () => {
  beforeEach(() => {
    prisma.booking.findUnique.mockReset();
    prisma.booking.update.mockReset();
  });

  it("allows customer cancellation before 24h boundary", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      userId: "user-1",
      bookingType: "ASSISTED",
      bookingStatus: "PENDING",
      paymentStatus: "PAID",
      refundStatus: "NONE",
      startTime: new Date("2027-01-15T03:00:00.000Z"),
    });
    prisma.booking.update.mockResolvedValue({});

    await cancelBooking(
      { id: "user-1", role: "CUSTOMER", emailVerified: true },
      "booking-1",
      "Đổi lịch",
      new Date("2027-01-14T00:00:00.000Z"),
    );

    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookingStatus: "CANCELLED", refundStatus: "REQUESTED" }),
      }),
    );
  });
});
