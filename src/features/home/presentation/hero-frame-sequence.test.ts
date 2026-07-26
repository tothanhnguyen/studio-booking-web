import { describe, expect, it } from "vitest";

import {
  HERO_FRAME_COUNT,
  HERO_PLAYBACK_FRAME_COUNT,
  createFrameBatches,
  getFrameIndex,
  getFrameUrl,
  shouldUseCanvas,
} from "./hero-frame-sequence";

describe("hero frame sequence", () => {
  it("maps each scene landing point to its selected composition frame", () => {
    expect(HERO_FRAME_COUNT).toBe(96);
    expect(HERO_PLAYBACK_FRAME_COUNT).toBe(57);
    expect(getFrameIndex(-1)).toBe(0);
    expect(getFrameIndex(0.48)).toBe(32);
    expect(getFrameIndex(1)).toBe(56);
    expect(getFrameIndex(2)).toBe(56);
  });

  it("interpolates smoothly between scene frames", () => {
    expect(getFrameIndex(0.24)).toBe(16);
    expect(getFrameIndex(0.74)).toBe(44);
  });

  it("builds stable zero-padded WebP URLs", () => {
    expect(getFrameUrl(0)).toBe("/media/hero-capsules-sequence/frame-0001.webp");
    expect(getFrameUrl(95)).toBe("/media/hero-capsules-sequence/frame-0096.webp");
  });

  it("groups preload work into batches instead of loading all frames at once", () => {
    const batches = createFrameBatches(12);

    expect(batches).toHaveLength(5);
    expect(batches[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(batches.at(-1)).toEqual([48, 49, 50, 51, 52, 53, 54, 55, 56]);
    expect(batches.flat()).toHaveLength(HERO_PLAYBACK_FRAME_COUNT);
  });

  it("enables canvas only for desktop users without reduced motion", () => {
    expect(shouldUseCanvas({ isDesktop: true, prefersReducedMotion: false })).toBe(true);
    expect(shouldUseCanvas({ isDesktop: false, prefersReducedMotion: false })).toBe(false);
    expect(shouldUseCanvas({ isDesktop: true, prefersReducedMotion: true })).toBe(false);
  });
});
