import { describe, expect, it } from "vitest";

import { getHeroState, HERO_SNAP_POINTS, HERO_STATE_PROGRESS } from "./hero-scroll-state";

describe("hero scroll state", () => {
  it("keeps the main hero active for the longest progress range", () => {
    expect(HERO_STATE_PROGRESS).toEqual({ brandEnd: 0.24, mainEnd: 0.72 });
    expect(getHeroState(0)).toBe("brand");
    expect(getHeroState(0.24)).toBe("main");
    expect(getHeroState(0.71)).toBe("main");
    expect(getHeroState(0.72)).toBe("rooms");
    expect(getHeroState(1)).toBe("rooms");
  });

  it("clamps out-of-range progress", () => {
    expect(getHeroState(-1)).toBe("brand");
    expect(getHeroState(2)).toBe("rooms");
  });

  it("exposes one landing point for each complete composition", () => {
    expect(HERO_SNAP_POINTS).toEqual([0, 0.48, 1]);
    expect(HERO_SNAP_POINTS.map(getHeroState)).toEqual(["brand", "main", "rooms"]);
  });
});
