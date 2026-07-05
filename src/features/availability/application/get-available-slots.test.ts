import { describe, expect, it, vi } from "vitest";

import { createGetAvailableSlots, ServiceUnavailableError } from "@/features/availability/application/get-available-slots";

const service = { id: "service-1", roomId: "room-1", durationMinutes: 30, bufferMinutes: 15 };
const baseData = {
  service,
  workingWindows: [{ openMinute: 540, closeMinute: 720 }],
  blockedRanges: [],
  bookings: [],
};

describe("getAvailableSlots", () => {
  it("rejects an inactive or missing service", async () => {
    const source = { load: vi.fn().mockResolvedValue({ ...baseData, service: null }) };
    await expect(createGetAvailableSlots(source)({ serviceId: "service-1", date: "2026-07-06", now: "2026-07-05T00:00:00.000Z" })).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it("ignores expired holds but blocks active holds and confirmed bookings", async () => {
    const source = { load: vi.fn().mockResolvedValue({ ...baseData, bookings: [
      { startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T02:45:00.000Z", bookingStatus: "PENDING_PAYMENT", holdExpiresAt: "2026-07-05T00:00:00.000Z" },
      { startTime: "2026-07-06T03:00:00.000Z", endTime: "2026-07-06T03:45:00.000Z", bookingStatus: "PENDING_PAYMENT", holdExpiresAt: "2026-07-05T00:11:00.000Z" },
      { startTime: "2026-07-06T04:00:00.000Z", endTime: "2026-07-06T04:45:00.000Z", bookingStatus: "CONFIRMED", holdExpiresAt: null },
      { startTime: "2026-07-06T04:30:00.000Z", endTime: "2026-07-06T05:15:00.000Z", bookingStatus: "CANCELLED", holdExpiresAt: null },
    ] }) };
    const slots = await createGetAvailableSlots(source)({ serviceId: "service-1", date: "2026-07-06", now: "2026-07-05T00:01:00.000Z" });
    expect(slots.map((slot) => slot.startTime)).toEqual([
      "2026-07-06T02:00:00.000Z",
      "2026-07-06T02:15:00.000Z",
    ]);
  });

  it("passes blocked slots into the pure engine", async () => {
    const source = { load: vi.fn().mockResolvedValue({ ...baseData, blockedRanges: [{ startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T05:00:00.000Z" }] }) };
    await expect(createGetAvailableSlots(source)({ serviceId: "service-1", date: "2026-07-06", now: "2026-07-05T00:00:00.000Z" })).resolves.toEqual([]);
  });
});
