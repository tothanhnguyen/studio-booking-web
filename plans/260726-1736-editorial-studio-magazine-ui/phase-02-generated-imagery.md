# Phase 2 — Generated Imagery: Room + Brand Photo Set

**Context:** `plan.md`, spec §4. Depends on nothing in Phase 1 (can start after Phase 1 gate for sequencing simplicity).
**Priority:** High — Phases 3 and 5 consume these assets.
**Status:** Complete (commits 630a40f+e783ec8+5a514b3 per `.superpowers/sdd/progress.md`, final review Approved for all 10 assets). Note: heroes shipped at 960px wide, not the ≥1920w line in Task 1 above — accepted deviation, see spec §4 (dated 2026-07-26 amendment) and final-review finding I7.

## Art direction (single shared prompt base — use verbatim, vary only the [ROOM] block)

> Warm film photography of a compact creative studio room interior, soft natural window light, warm ivory-grey backdrop tone `#E7E1D8`, gentle film grain, shallow depth of field, no people, no text, no logos, editorial magazine quality, muted warm grade matching a warm grey studio stage.
>
> [ROOM photo-studio]: photography studio with softbox lights, camera on tripod, wooden stool, white seamless backdrop; accent tone warm ivory.
> [ROOM voice-podcast-booth]: intimate podcast booth, two broadcast microphones on arms, acoustic foam panels, dark charcoal walls; accent tone soft graphite.
> [ROOM music-studio]: compact music production room, studio monitors, synthesizer/keyboard, electric guitar, walnut desk; accent tone muted sage green `#5a6b58`.
>
> [BRAND auth-statement]: three floating rounded studio capsule pods (ivory, charcoal, sage green) on a warm grey stage, minimal 3D render style matching product photography, soft shadow beneath.

## Task 1: Generate candidates

**Files:**
- Create (working dir, not committed): `/private/tmp/.../scratchpad/imagery/*` (executor's session scratchpad)

- [x] **Step 1:** Invoke the `ai-multimodal` skill. Generate per target at least 2 candidates, landscape ≥1920×1280 where the model allows:
  - `photo-studio` hero + detail-1 (close-up of softbox/camera) + detail-2 (stool against backdrop)
  - `voice-podcast-booth` hero + detail-1 (microphones) + detail-2 (acoustic panels/chairs)
  - `music-studio` hero + detail-1 (desk with monitors/synth) + detail-2 (guitar)
  - `auth-statement` brand image
- [x] **Step 2:** If a generation script fails, fix invocation and retry until images are produced (skill rule).
- [x] **Step 3:** Build a review montage: `magick montage scratchpad/imagery/*.png -tile 4x -geometry +8+8 scratchpad/imagery/review.png` and inspect with the Read tool. Discard any candidate that is off-palette (cool/blue cast, saturated colors), contains text/people/logos, or breaks the warm grade.

## Task 2: Grade and optimize

**Files:**
- Overwrite: `public/media/rooms/photo-studio.webp`, `public/media/rooms/voice-podcast-booth.webp`, `public/media/rooms/music-studio.webp` (hero shots — existing paths kept so `RoomVisual` keeps working)
- Create: `public/media/rooms/photo-studio-detail-1.webp`, `photo-studio-detail-2.webp`, `voice-podcast-booth-detail-1.webp`, `voice-podcast-booth-detail-2.webp`, `music-studio-detail-1.webp`, `music-studio-detail-2.webp`
- Create: `public/media/brand/auth-statement.webp`

- [x] **Step 1:** Grade each selected candidate toward the house palette (adjust per image; this is the baseline):

```bash
magick input.png -modulate 100,88,100 -fill "#E7E1D8" -colorize 4% \
  -attenuate 0.15 +noise Gaussian -resize 1920x\> input-graded.png
```

- [x] **Step 2:** Export webp, iterating quality down from 82 until each hero ≤ 250KB and each detail ≤ 150KB:

```bash
magick input-graded.png -quality 82 output.webp && ls -la output.webp
```

- [x] **Step 3:** Side-by-side consistency check against the hero poster:

```bash
magick montage public/media/hero-capsules-poster.webp public/media/rooms/*.webp \
  -tile 4x -geometry +6+6 scratchpad/imagery/final-review.png
```

Read `final-review.png`; all images must read as one warm set. Regenerate outliers (return to Task 1 for that target only).

- [x] **Step 4: Commit**

`feat: add generated editorial room and brand photo set`

## Task 3: Extend RoomVisual with variants (TDD)

**Files:**
- Modify: `src/features/studio-room/presentation/room-visual.tsx`
- Test: `src/features/studio-room/presentation/room-visual.test.tsx`

**Interfaces:**
- Produces: `variant?: "hero" | "detail-1" | "detail-2"` (default `"hero"`) on `RoomVisualProps`; `data-variant` attribute on the `<figure>`. Existing call sites keep working without changes.

- [x] **Step 1: Add failing tests** to `room-visual.test.tsx`:

```tsx
it("resolves detail variants to suffixed assets", () => {
  render(<RoomVisual alt="Chi tiết phòng" slug="music-studio" variant="detail-1" />);
  const image = screen.getByRole("img", { name: "Chi tiết phòng" });
  expect(image.getAttribute("src")).toContain("music-studio-detail-1.webp");
});

it("defaults to the hero asset when variant is omitted", () => {
  render(<RoomVisual alt="Phòng nhạc" slug="music-studio" />);
  const image = screen.getByRole("img", { name: "Phòng nhạc" });
  expect(image.getAttribute("src")).toContain("music-studio.webp");
});
```

(Note: `next/image` may encode `src` into `/_next/image?url=...`; assert with `decodeURIComponent` if needed.)

- [x] **Step 2: Run — FAIL** (`variant` prop not accepted / wrong src).

- [x] **Step 3: Implement** — in `room-visual.tsx`, add to the existing component:

```tsx
export type RoomVisualVariant = "hero" | "detail-1" | "detail-2";
```

Extend `RoomVisualProps` with `variant?: RoomVisualVariant`. Resolve the src:

```tsx
const base = roomVisuals[slug as keyof typeof roomVisuals] ?? fallbackVisual;
const src =
  variant && variant !== "hero" && base !== fallbackVisual
    ? base.src.replace(/\.webp$/, `-${variant}.webp`)
    : base.src;
```

Render `data-variant={variant ?? "hero"}` on the `<figure>` and pass `src` to `<Image>`. Fallback visual ignores variants (always poster).

- [x] **Step 4: Run — PASS:** `pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx`

- [x] **Step 5: Commit**

`feat: add room visual detail variants`

## Task 4: Phase gate

- [x] `pnpm ci:verify` — PASS.
- [x] All 10 new/updated assets exist; `du -h public/media/rooms public/media/brand` totals within budget (heroes ≤250KB, details ≤150KB each).
- [x] Visual: open `/studios` — new hero images render via existing `RoomVisual` call sites with the warm grade.

## Success Criteria

A consistent, warm-graded generated photo set is live under `public/media/`, `RoomVisual` supports detail variants, and no page is broken.
