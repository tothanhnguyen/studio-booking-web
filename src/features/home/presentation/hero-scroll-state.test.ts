import { describe, expect, it } from "vitest";

import {
  getHeroState,
  getHeroSnapProgress,
  HERO_SCENES,
  HERO_SNAP_POINTS,
  HERO_STATE_PROGRESS,
} from "./hero-scroll-state";

describe("hero scroll state", () => {
  it("keeps the main hero active for the longest progress range", () => {
    expect(HERO_STATE_PROGRESS).toEqual({ brandEnd: 0.24, mainEnd: 0.74 });
    expect(getHeroState(0)).toBe("brand");
    expect(getHeroState(0.24)).toBe("main");
    expect(getHeroState(0.73)).toBe("main");
    expect(getHeroState(0.74)).toBe("rooms");
    expect(getHeroState(1)).toBe("rooms");
  });

  it("clamps out-of-range progress", () => {
    expect(getHeroState(-1)).toBe("brand");
    expect(getHeroState(2)).toBe("rooms");
  });

  it("exposes one landing point for each complete composition", () => {
    expect(HERO_SNAP_POINTS).toEqual([0, 0.48, 1]);
    expect(HERO_SNAP_POINTS.map(getHeroState)).toEqual(["brand", "main", "rooms"]);
    expect(HERO_SCENES.map(({ frameIndex }) => frameIndex)).toEqual([0, 32, 56]);
  });

  it("settles intermediate progress at the nearest scene in both directions", () => {
    expect(getHeroSnapProgress(-1)).toBe(0);
    expect(getHeroSnapProgress(0.1)).toBe(0);
    expect(getHeroSnapProgress(0.36)).toBe(0.48);
    expect(getHeroSnapProgress(0.62)).toBe(0.48);
    expect(getHeroSnapProgress(0.82)).toBe(1);
    expect(getHeroSnapProgress(2)).toBe(1);
  });

  it("keeps scene progress and frame anchors strictly increasing", () => {
    for (let index = 1; index < HERO_SCENES.length; index += 1) {
      expect(HERO_SCENES[index].progress).toBeGreaterThan(HERO_SCENES[index - 1].progress);
      expect(HERO_SCENES[index].frameIndex).toBeGreaterThan(HERO_SCENES[index - 1].frameIndex);
    }
  });
});
