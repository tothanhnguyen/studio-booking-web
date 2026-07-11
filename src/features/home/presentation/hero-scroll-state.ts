export type HeroState = "brand" | "main" | "rooms";

export const HERO_STATE_PROGRESS = {
  brandEnd: 0.24,
  mainEnd: 0.72,
} as const;

export const HERO_SNAP_POINTS = [0, 0.48, 1] as const;

export function getHeroState(progress: number): HeroState {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  if (safeProgress < HERO_STATE_PROGRESS.brandEnd) return "brand";
  if (safeProgress < HERO_STATE_PROGRESS.mainEnd) return "main";
  return "rooms";
}
