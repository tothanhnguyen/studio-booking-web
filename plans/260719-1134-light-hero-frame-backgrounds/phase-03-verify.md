# Phase 3 — Verify Continuity and Accessibility

## Context Links

- [Plan](./plan.md)
- [Asset phase](./phase-01-rematte-assets.md)
- [Palette phase](./phase-02-align-hero-palette.md)

## Overview

- Priority: P1
- Status: Completed
- Goal: prove the sequence, fallbacks, and light palette behave correctly.

## Requirements

- Check representative early/middle/late frames and the poster.
- Confirm 96 URLs still resolve and frame mapping remains unchanged.
- Confirm readable focus, CTA, text, mobile fallback, and reduced motion.

## Related Code Files

- Modify only if verification exposes a defect in phase-owned files.

## Implementation Steps

1. Validate file count, dimensions, MIME, and decode for every asset.
2. Run focused hero tests, lint, typecheck, and production build.
3. Run the app and inspect desktop/mobile screenshots plus representative scroll states.
4. Update plan/phase status with actual results.

## Todo List

- [x] Asset integrity checks pass.
- [x] Focused tests pass.
- [x] Static checks and build pass.
- [x] Visual QA passes.

## Success Criteria

- No black flash between poster and canvas frames.
- No visible subject erosion, halo, or frame-to-frame color flicker.
- Hero remains accessible and responsive.

## Risks

- Browser WebP encoding differences. Mitigate with decode checks and real browser screenshots.

## Security Considerations

No security-sensitive surface changed.
