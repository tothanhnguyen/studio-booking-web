import { describe, expect, it } from "vitest";

import { formatStudioDateTime } from "@/features/dashboard/presentation/booking-calendar";

describe("booking calendar presentation", () => {
  it("renders stored UTC timestamps in the studio timezone", () => {
    expect(formatStudioDateTime("2027-08-01T02:00:00.000Z")).toBe("01/08/2027 09:00");
  });
});
