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

import { confirmAssistedBooking } from "@/features/booking/application/confirm-assisted-booking";

describe("confirm-assisted-booking", () => {
  beforeEach(() => {
    prisma.booking.findUnique.mockReset();
    prisma.booking.update.mockReset();
  });

  it("confirms assisted booking when paid and pending", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      bookingType: "ASSISTED",
      bookingStatus: "PENDING",
      paymentStatus: "PAID",
    });
    prisma.booking.update.mockResolvedValue({});

    await confirmAssistedBooking(
      { id: "admin", role: "ADMIN", emailVerified: true },
      "booking-1",
    );

    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookingStatus: "CONFIRMED" }),
      }),
    );
  });
});
