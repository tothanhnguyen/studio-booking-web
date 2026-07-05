import { describe, expect, it, vi } from "vitest";

import { createGetGuestBooking } from "@/features/booking/application/get-guest-booking";
import { hashGuestToken } from "@/lib/security/guest-token";

const booking = {
  id: "booking-1", serviceName: "Thuê phòng chụp ảnh", roomName: "Photo Studio",
  startTime: "2027-01-15T03:00:00.000Z", endTime: "2027-01-15T05:00:00.000Z",
  holdExpiresAt: "2027-01-01T00:10:00.000Z", depositAmount: 240_000,
  remainingAmount: 560_000, currency: "VND", bookingStatus: "PENDING_PAYMENT",
  guestAccessTokenHash: hashGuestToken("correct-token"),
};

describe("getGuestBooking", () => {
  it("returns a private view when the raw token matches", async () => {
    const repository = { findGuestBooking: vi.fn().mockResolvedValue(booking) };
    const result = await createGetGuestBooking(repository)("booking-1", "correct-token");
    expect(result).toEqual(expect.objectContaining({ id: "booking-1", serviceName: booking.serviceName }));
    expect(result).not.toHaveProperty("guestAccessTokenHash");
  });

  it("returns null for a missing booking or wrong token", async () => {
    const repository = { findGuestBooking: vi.fn().mockResolvedValue(booking) };
    await expect(createGetGuestBooking(repository)("booking-1", "wrong-token")).resolves.toBeNull();
    repository.findGuestBooking.mockResolvedValue(null);
    await expect(createGetGuestBooking(repository)("missing", "correct-token")).resolves.toBeNull();
  });
});
