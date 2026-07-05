import { describe, expect, it, vi } from "vitest";

import { createClaimGuestBookings, UnverifiedClaimError } from "@/features/auth/application/claim-guest-bookings";

describe("claimGuestBookings", () => {
  it("claims by normalized verified email", async () => {
    const repository = { claimUnownedByVerifiedEmail: vi.fn().mockResolvedValue(2) };
    const result = await createClaimGuestBookings(repository)({ id: "user-1", role: "CUSTOMER", email: "AN@Example.com", emailVerified: true });
    expect(repository.claimUnownedByVerifiedEmail).toHaveBeenCalledWith("user-1", "an@example.com");
    expect(result).toEqual({ claimedCount: 2 });
  });

  it("rejects actors without a verified email", async () => {
    const repository = { claimUnownedByVerifiedEmail: vi.fn() };
    await expect(createClaimGuestBookings(repository)({ id: "user-1", role: "CUSTOMER", email: "an@example.com", emailVerified: false })).rejects.toBeInstanceOf(UnverifiedClaimError);
    expect(repository.claimUnownedByVerifiedEmail).not.toHaveBeenCalled();
  });
});
