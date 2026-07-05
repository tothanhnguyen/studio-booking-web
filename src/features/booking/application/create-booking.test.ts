import { describe, expect, it, vi } from "vitest";

import { createBookingUseCase } from "@/features/booking/application/create-booking";

describe("createBooking", () => {
  it("passes only validated customer intent and a token hash to persistence", async () => {
    const repository = { createHold: vi.fn().mockResolvedValue({ bookingId: "booking-1", holdExpiresAt: "2026-07-05T00:10:00.000Z" }) };
    const tokenFactory = vi.fn().mockReturnValue({ rawToken: "raw-secret", tokenHash: "hashed-secret" });
    const createBooking = createBookingUseCase({ repository, tokenFactory, now: () => new Date("2026-07-05T00:00:00.000Z") });

    const result = await createBooking({
      serviceId: "2189c3be-fcb5-4dd9-8957-feb14f170ab8",
      startTime: "2026-07-06T02:00:00.000Z",
      customerName: "Nguyễn An", customerEmail: "an@example.com", customerPhone: "0900000000", note: "Test",
      subtotalAmount: 1, endTime: "2099-01-01T00:00:00.000Z", bookingStatus: "CONFIRMED",
    });

    expect(repository.createHold).toHaveBeenCalledWith({
      serviceId: "2189c3be-fcb5-4dd9-8957-feb14f170ab8",
      startTime: "2026-07-06T02:00:00.000Z",
      customerName: "Nguyễn An", customerEmail: "an@example.com", customerPhone: "0900000000", note: "Test",
    }, "hashed-secret", new Date("2026-07-05T00:00:00.000Z"));
    expect(result).toEqual({ bookingId: "booking-1", guestToken: "raw-secret", holdExpiresAt: "2026-07-05T00:10:00.000Z" });
    expect(JSON.stringify(repository.createHold.mock.calls)).not.toContain("raw-secret");
  });

  it("rejects an invalid contact or start instant before persistence", async () => {
    const repository = { createHold: vi.fn() };
    const createBooking = createBookingUseCase({ repository, tokenFactory: vi.fn(), now: () => new Date() });
    await expect(createBooking({ serviceId: "nope", startTime: "tomorrow", customerName: "", customerEmail: "bad" })).rejects.toThrow();
    expect(repository.createHold).not.toHaveBeenCalled();
  });
});
