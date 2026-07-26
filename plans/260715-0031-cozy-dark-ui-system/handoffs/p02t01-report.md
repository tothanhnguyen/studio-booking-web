# Phase 02 Task 1 Report: RoomVisual

## Status

Complete. Added the three derived room assets, the typed `RoomVisual` component, component tests, and the capsule portal utility styles. No Git index, branch, commit, push, stash, or reset operation was performed.

## TDD evidence

### RED

Created `room-visual.test.tsx` before production code with coverage for:

- all three slug-to-asset/material mappings;
- the unknown-slug hero-poster/podcast fallback;
- optional custom class composition.

Command:

```text
pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx
```

Result: exit 1 as expected. Vitest reported `Failed to resolve import "./room-visual"`; zero tests ran because the production module did not exist.

### GREEN

Implemented the minimal mapped component and reran the same command.

Result: exit 0; 1 test file passed, 5 tests passed.

## Asset derivation and validation

Source: `public/media/hero-capsules-sequence/frame-0032.webp` (1440×1080).

Exact crop rectangles from the brief were applied with ffmpeg:

- Photo Studio: `crop=520:480:400:60`
- Voice/Podcast Booth: `crop=520:480:380:500`
- Music Studio: `crop=520:480:820:280`

The installed ffmpeg build can decode WebP but has no WebP encoder. Its direct `.webp` commands failed before producing files. The exact ffmpeg crops were therefore written as temporary PNGs, then deterministically encoded to WebP with Pillow (`quality=80`, `method=6`). Temporary intermediates were removed.

Validation:

```text
sips -g pixelWidth -g pixelHeight -g format public/media/rooms/*.webp
file public/media/rooms/*.webp
```

All three assets report `520×480`, format `webp`; `file` identifies each as RIFF Web/P with VP8 encoding.

Visual inspection at original resolution confirmed:

- Photo: front-facing ivory capsule, camera and two lights centered.
- Podcast: front-facing graphite booth, two microphones and two chairs centered.
- Music: front-facing sage capsule, workstation, monitors, and guitar centered.
- Small neighboring-capsule edges visible in the photo/music crops match the brief's exact rectangles.

SHA-256:

```text
238ecb3f577e84dd983b2bd7f10e6b9f88df5cef9af622a8c69eb3d4e25466d8  music-studio.webp
842b4909141b7c015cb8484e43c1e27f8ae129faeaded3cf28884d780433feea  photo-studio.webp
78eeed9d90f4f97aaabef835ff31b75da578852deeb81ee081ea55c8519b00b2  voice-podcast-booth.webp
```

## Implementation review

- Exports the exact `RoomMaterial` union and readonly `RoomVisualProps` interface from the plan.
- Uses the exact known-slug mapping from the brief.
- Unknown slugs use `/media/hero-capsules-poster.webp` and `podcast` material.
- Renders `figure.room-visual` with `data-testid` and `data-room-material`.
- Uses `next/image` with `fill`, responsive `sizes`, and the received `priority` value.
- Preserves an optional caller class without replacing `room-visual`.
- Styles the 13:12 clipped capsule with the shared large radius, Warm line border, and material-specific ivory/graphite/sage inset glow.
- Hover/focus-within image movement is limited to `scale(1.025)` over `var(--motion-base)`.
- No hero asset or non-task implementation file was modified.

## Files

Created:

- `public/media/rooms/photo-studio.webp`
- `public/media/rooms/voice-podcast-booth.webp`
- `public/media/rooms/music-studio.webp`
- `src/features/studio-room/presentation/room-visual.tsx`
- `src/features/studio-room/presentation/room-visual.test.tsx`
- `plans/260715-0031-cozy-dark-ui-system/handoffs/p02t01-report.md`

Modified:

- `src/styles/utilities.css`

## Verification

```text
pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx
  PASS — 1 file, 5 tests

pnpm typecheck
  PASS — tsc --noEmit, exit 0

pnpm eslint src/features/studio-room/presentation/room-visual.tsx src/features/studio-room/presentation/room-visual.test.tsx
  PASS — exit 0, no findings

pnpm test
  PASS — 44 files, 138 tests, exit 0
```

## Concerns

- Reproducibility note: direct WebP output requires an ffmpeg build with a WebP encoder; this machine required the documented Pillow encoding fallback.
- The full suite emits two redacted `readiness.check_failed` ETIMEDOUT log records while testing failure handling, but all 44 files and 138 tests pass with exit 0.
- No unresolved implementation concerns.
