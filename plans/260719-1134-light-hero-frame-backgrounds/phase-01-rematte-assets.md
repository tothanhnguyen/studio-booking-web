# Phase 1 — Re-matte Hero Assets

## Context Links

- [Plan](./plan.md)
- `public/media/hero-capsules-sequence/frame-0001.webp` through `frame-0096.webp`
- `public/media/hero-capsules-poster.webp`

## Overview

- Priority: P1
- Status: Completed
- Goal: create a temporally stable background mask and composite every hero asset onto `#F3F1EC`.

## Requirements

- Preserve 1440x1080 dimensions and WebP filenames.
- Use identical mask rules across the sequence.
- Protect enclosed dark regions inside the podcast and music booths.
- Retain a soft, low-contrast contact shadow instead of a floating cutout.

## Architecture

Offline batch pipeline: decode WebP → classify border-connected stage pixels in Lab color space → soften the matte edge → retain attenuated floor/contact shadow → composite over warm off-white → encode WebP atomically.

## Related Code Files

- Modify: `/Users/thanhnguyen/Documents/MowStudio/public/media/hero-capsules-sequence/frame-*.webp`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/public/media/hero-capsules-poster.webp`

## Implementation Steps

1. Prototype matte on frames 1, 48, and 96.
2. Inspect booth edges and dark interiors; tune one shared threshold.
3. Process into a temporary directory, validate count/dimensions/decodability.
4. Replace tracked assets only after validation; regenerate poster from processed frame 1.

## Todo List

- [x] Validate representative mattes.
- [x] Process 96 frames.
- [x] Replace poster with matching processed frame.
- [x] Verify all outputs.

## Success Criteria

- No missing/corrupt frame; no frame dimension drift.
- Representative frames show clean consistent background and protected subjects.

## Risks

- Dark booth shell may resemble background. Mitigate with border connectivity, subject-protection seeds, and representative-frame review.
- Edge halo may flicker. Mitigate with one stable feathering rule and temporal spot checks.

## Security Considerations

No runtime input or network path added. Processing is local and asset-only.
