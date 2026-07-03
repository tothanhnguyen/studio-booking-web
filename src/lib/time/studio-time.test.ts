import { describe, expect, it } from "vitest";

import { toStudioDateKey, toUtcFromStudioLocal } from "./studio-time";

describe("studio time", () => {
  it("converts a Ho Chi Minh local date and time to UTC", () => {
    expect(toUtcFromStudioLocal("2026-07-03", "09:15").toISOString()).toBe(
      "2026-07-03T02:15:00.000Z",
    );
  });

  it("derives the studio-local date instead of the host UTC date", () => {
    expect(toStudioDateKey(new Date("2026-07-02T18:30:00.000Z"))).toBe("2026-07-03");
  });

  it.each([
    ["2026-02-30", "09:15"],
    ["2026-07-03", "24:00"],
    ["03-07-2026", "09:15"],
  ])("rejects invalid studio-local input %s %s", (date, time) => {
    expect(() => toUtcFromStudioLocal(date, time)).toThrow("studio local date/time");
  });

  it("rejects an invalid Date", () => {
    expect(() => toStudioDateKey(new Date(Number.NaN))).toThrow("valid Date");
  });
});
