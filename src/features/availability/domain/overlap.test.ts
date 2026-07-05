import { describe, expect, it } from "vitest";

import { overlaps } from "@/features/availability/domain/overlap";

describe("overlaps", () => {
  it.each([
    ["adjacent ranges", { startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T03:00:00.000Z" }, { startTime: "2026-07-06T03:00:00.000Z", endTime: "2026-07-06T04:00:00.000Z" }, false],
    ["one-minute overlap", { startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T03:01:00.000Z" }, { startTime: "2026-07-06T03:00:00.000Z", endTime: "2026-07-06T04:00:00.000Z" }, true],
    ["contained range", { startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T05:00:00.000Z" }, { startTime: "2026-07-06T03:00:00.000Z", endTime: "2026-07-06T04:00:00.000Z" }, true],
  ])("handles %s", (_name, a, b, expected) => {
    expect(overlaps(a, b)).toBe(expected);
    expect(overlaps(b, a)).toBe(expected);
  });
});
