import { describe, expect, it } from "vitest";

import { generateAvailableSlots } from "@/features/availability/domain/generate-slots";

const baseInput = {
  date: "2026-07-06",
  timezone: "Asia/Ho_Chi_Minh",
  workingWindows: [{ openMinute: 540, closeMinute: 600 }],
  durationMinutes: 30,
  bufferMinutes: 15,
  blockedRanges: [],
  bookingRanges: [],
  now: "2026-07-05T00:00:00.000Z",
} as const;

describe("generateAvailableSlots", () => {
  it("generates starts on a 15-minute grid and keeps buffer inside the working window", () => {
    expect(generateAvailableSlots(baseInput)).toEqual([
      { startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T02:30:00.000Z", bufferEndTime: "2026-07-06T02:45:00.000Z" },
      { startTime: "2026-07-06T02:15:00.000Z", endTime: "2026-07-06T02:45:00.000Z", bufferEndTime: "2026-07-06T03:00:00.000Z" },
    ]);
  });

  it("does not generate slots across split working windows", () => {
    const slots = generateAvailableSlots({ ...baseInput, workingWindows: [
      { openMinute: 540, closeMinute: 570 },
      { openMinute: 600, closeMinute: 660 },
    ], bufferMinutes: 0 });

    expect(slots.map((slot) => slot.startTime)).toEqual([
      "2026-07-06T02:00:00.000Z",
      "2026-07-06T03:00:00.000Z",
      "2026-07-06T03:15:00.000Z",
      "2026-07-06T03:30:00.000Z",
    ]);
  });

  it("removes candidates overlapping blocked and active booking ranges", () => {
    const slots = generateAvailableSlots({
      ...baseInput,
      workingWindows: [{ openMinute: 540, closeMinute: 660 }],
      blockedRanges: [{ startTime: "2026-07-06T02:40:00.000Z", endTime: "2026-07-06T03:00:00.000Z" }],
      bookingRanges: [{ startTime: "2026-07-06T03:30:00.000Z", endTime: "2026-07-06T04:00:00.000Z" }],
    });

    expect(slots.map((slot) => slot.startTime)).toEqual([]);
  });

  it("removes starts before now", () => {
    const slots = generateAvailableSlots({ ...baseInput, now: "2026-07-06T02:01:00.000Z" });
    expect(slots.map((slot) => slot.startTime)).toEqual(["2026-07-06T02:15:00.000Z"]);
  });
});
