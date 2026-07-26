---
title: "Light hero backgrounds"
created: 2026-07-19
tags: [frontend, hero, media]
---

# Light Hero Backgrounds

## Context

The scroll hero's dark raster stage needed to become a modern warm light surface without re-rendering 96 frames independently or introducing animation jitter.

## What Happened

- Selected `#F3F1EC` as the shared frame and hero background.
- Re-matted 96 WebP frames with U2Net, then stabilized masks with optical-flow-aligned temporal consensus and enclosed-hole repair.
- Replaced the static poster with processed frame 1.
- Added hero-scoped light tokens and converted hero/header foregrounds to warm graphite, muted gray, brass, and dark sage.

## Decisions

- Keep all processing offline; the runtime canvas loader and 300vh GSAP mapping remain unchanged.
- Preserve the rest of the product's dark UI by scoping light overrides to `#home-hero` and `.home-hero`.
- Retain the batch and temporal-repair scripts under the plan for reproducibility; remove generated intermediates after shipping assets.

## Verification

- 96/96 assets decode at 1440x1080.
- 11 hero tests, lint, typecheck, and production build pass.
- Desktop frames 0/48/95 and 375px mobile fallback pass browser QA with no console issues or overflow.
