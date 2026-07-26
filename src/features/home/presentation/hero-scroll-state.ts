export type HeroState = "brand" | "main" | "rooms";

export const HERO_SCENES = [
  { state: "brand", progress: 0, frameIndex: 0 },
  { state: "main", progress: 0.48, frameIndex: 32 },
  { state: "rooms", progress: 1, frameIndex: 56 },
] as const satisfies ReadonlyArray<{
  state: HeroState;
  progress: number;
  frameIndex: number;
}>;

export const HERO_STATE_PROGRESS = {
  brandEnd: (HERO_SCENES[0].progress + HERO_SCENES[1].progress) / 2,
  mainEnd: (HERO_SCENES[1].progress + HERO_SCENES[2].progress) / 2,
} as const;

export const HERO_SNAP_POINTS = HERO_SCENES.map(({ progress }) => progress);

export function getHeroSnapProgress(progress: number): number {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  return HERO_SNAP_POINTS.reduce((nearest, snapPoint) =>
    Math.abs(snapPoint - safeProgress) <= Math.abs(nearest - safeProgress) ? snapPoint : nearest,
  );
}

export function getHeroState(progress: number): HeroState {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  if (safeProgress < HERO_STATE_PROGRESS.brandEnd) return "brand";
  if (safeProgress < HERO_STATE_PROGRESS.mainEnd) return "main";
  return "rooms";
}
