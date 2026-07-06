import { describe, expect, it } from "vitest";

import { createGetGuestBooking } from "@/features/booking/application/get-guest-booking";
import { hashGuestToken } from "@/lib/security/guest-token";

describe("get-payment-view authorization shape", () => {
  it("keeps guest token authorization behavior for private booking view", async () => {
    const repository = {
      findGuestBooking: async () => ({
        id: "11111111-1111-4111-8111-111111111111",
        serviceName: "Thuê phòng chụp ảnh",
        roomName: "Photo Studio",
        startTime: "2027-01-15T03:00:00.000Z",
        endTime: "2027-01-15T05:00:00.000Z",
        holdExpiresAt: "2027-01-15T01:00:00.000Z",
        depositAmount: 240_000,
        remainingAmount: 560_000,
        currency: "VND",
        bookingStatus: "PENDING_PAYMENT",
        guestAccessTokenHash: hashGuestToken("secret"),
      }),
    };
    await expect(createGetGuestBooking(repository)("11111111-1111-4111-8111-111111111111", "secret")).resolves.not.toBeNull();
    await expect(createGetGuestBooking(repository)("11111111-1111-4111-8111-111111111111", "wrong")).resolves.toBeNull();
  });
});
