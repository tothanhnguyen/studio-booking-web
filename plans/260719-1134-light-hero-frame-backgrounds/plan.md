---
title: "Light hero frame backgrounds"
description: "Replace the scroll-frame stage and hero backdrop with one modern warm off-white palette while preserving the existing animation."
status: completed
priority: P2
effort: 2h
branch: tnguyen/phase7.2
tags: [feature, frontend]
blockedBy: []
blocks: []
created: 2026-07-19
---

# Light Hero Frame Backgrounds

> **Superseded on 2026-07-19:** This completed plan records the earlier flat `#F3F1EC` rematte. The later [hero media refresh](../../docs/journals/260719-1355-media-refresh.md) replaced those assets with a warm taupe/gray vignette; the current hero CSS follows that replacement palette. The results below remain as historical verification of this plan.

## Overview

Re-matte all 96 hero sequence frames and the static poster onto `#F3F1EC`. Update only the home hero's backdrop and foreground palette so the canvas, fallback image, copy, controls, and room selector remain coherent and accessible.

## Scope

- Preserve 1440x1080 frame dimensions, filenames, order, booth geometry, and scroll timing.
- Replace only the connected dark stage around the booths; retain dark booth interiors and subtle grounding shadows.
- Keep the rest of the site's cozy-dark UI unchanged.
- Do not regenerate individual frames; deterministic processing prevents animation jitter.

## Cross-Plan Dependencies

No blocking dependency. `260715-0031-cozy-dark-ui-system` shares the CSS foundation but explicitly excludes hero redesign; this plan limits changes to hero-specific selectors and assets.

## Phases

| Phase | Name | Status |
|---|---|---|
| 1 | [Re-matte hero assets](./phase-01-rematte-assets.md) | Completed |
| 2 | [Align the hero palette](./phase-02-align-hero-palette.md) | Completed |
| 3 | [Verify continuity and accessibility](./phase-03-verify.md) | Completed |

## Dependencies

- Bundled Pillow, NumPy, and OpenCV runtime for deterministic offline matting.
- Existing Next.js canvas sequence, GSAP scroll mapping, Vitest, and Playwright setup.

## Success Criteria

- All 96 frames and poster use the same warm off-white stage with no pure-white flash.
- Booth interiors, colors, crop, and frame-to-frame motion remain stable.
- Hero text and controls meet readable contrast on the new light background.
- Focused tests, lint/typecheck, and production build pass.

## Verification Result

- 96/96 WebP frames and poster decode at 1440x1080; warm stage corner mean `[243, 241, 237]`.
- Hero contrast ratios range from 5.22:1 to 15.33:1; primary action text is 10.06:1.
- 11 focused hero tests, ESLint, TypeScript, and `next build` pass.
- Browser QA passes at desktop frames 0/48/95 and 375px mobile fallback with no console issues or horizontal overflow.
