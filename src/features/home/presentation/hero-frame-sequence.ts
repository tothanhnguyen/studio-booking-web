import { HERO_SCENES } from "./hero-scroll-state";

export const HERO_FRAME_COUNT = 96;
export const HERO_POSTER_SRC = "/media/hero-capsules-poster.webp";

export const HERO_PLAYBACK_FRAME_COUNT = HERO_SCENES[HERO_SCENES.length - 1].frameIndex + 1;

const FRAME_DIRECTORY = "/media/hero-capsules-sequence";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getFrameIndex(progress: number): number {
  const safeProgress = clamp(progress, 0, 1);

  for (let index = 1; index < HERO_SCENES.length; index += 1) {
    const previousScene = HERO_SCENES[index - 1];
    const nextScene = HERO_SCENES[index];
    if (safeProgress <= nextScene.progress) {
      const segmentProgress =
        (safeProgress - previousScene.progress) / (nextScene.progress - previousScene.progress);
      return Math.round(
        previousScene.frameIndex +
          segmentProgress * (nextScene.frameIndex - previousScene.frameIndex),
      );
    }
  }

  return HERO_SCENES[HERO_SCENES.length - 1].frameIndex;
}

export function getFrameUrl(index: number): string {
  const safeIndex = clamp(Math.round(index), 0, HERO_FRAME_COUNT - 1);
  return `${FRAME_DIRECTORY}/frame-${String(safeIndex + 1).padStart(4, "0")}.webp`;
}

export function createFrameBatches(batchSize: number): number[][] {
  const frameIndexes = Array.from({ length: HERO_PLAYBACK_FRAME_COUNT }, (_, index) => index);
  const batches: number[][] = [];

  for (let start = 0; start < frameIndexes.length; start += batchSize) {
    batches.push(frameIndexes.slice(start, start + batchSize));
  }

  return batches;
}

export function shouldUseCanvas({
  isDesktop,
  prefersReducedMotion,
}: Readonly<{ isDesktop: boolean; prefersReducedMotion: boolean }>): boolean {
  return isDesktop && !prefersReducedMotion;
}
