import { describe, expect, it } from "vitest";

import {
  HERO_FRAME_COUNT,
  createFrameBatches,
  getFrameIndex,
  getFrameUrl,
  shouldUseCanvas,
} from "./hero-frame-sequence";

describe("hero frame sequence", () => {
  it("maps clamped scroll progress to one of 96 frames", () => {
    expect(HERO_FRAME_COUNT).toBe(96);
    expect(getFrameIndex(-1)).toBe(0);
    expect(getFrameIndex(0.5)).toBe(48);
    expect(getFrameIndex(1)).toBe(95);
    expect(getFrameIndex(2)).toBe(95);
  });

  it("builds stable zero-padded WebP URLs", () => {
    expect(getFrameUrl(0)).toBe("/media/hero-capsules-sequence/frame-0001.webp");
    expect(getFrameUrl(95)).toBe("/media/hero-capsules-sequence/frame-0096.webp");
  });

  it("groups preload work into batches instead of loading all frames at once", () => {
    const batches = createFrameBatches(12);

    expect(batches).toHaveLength(8);
    expect(batches[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(batches.flat()).toHaveLength(HERO_FRAME_COUNT);
  });

  it("enables canvas only for desktop users without reduced motion", () => {
    expect(shouldUseCanvas({ isDesktop: true, prefersReducedMotion: false })).toBe(true);
    expect(shouldUseCanvas({ isDesktop: false, prefersReducedMotion: false })).toBe(false);
    expect(shouldUseCanvas({ isDesktop: true, prefersReducedMotion: true })).toBe(false);
  });
});
