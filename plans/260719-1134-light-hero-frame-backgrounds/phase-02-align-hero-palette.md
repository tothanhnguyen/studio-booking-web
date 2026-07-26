# Phase 2 — Align the Hero Palette

## Context Links

- [Plan](./plan.md)
- `src/features/home/presentation/scroll-video-hero.tsx`
- `src/features/home/presentation/hero-main-state.tsx`
- `src/features/home/presentation/hero-room-selector.tsx`
- `src/features/home/presentation/hero-brand-state.tsx`
- `src/styles/hero.css`

## Overview

- Priority: P1
- Status: Completed
- Goal: make the pinned hero visually continuous with the warm off-white frame stage.

## Requirements

- Use `#F3F1EC`, never pure `#FFFFFF`, as the hero canvas color.
- Convert hero-only copy, wordmark, borders, chips, and secondary CTA to warm dark foregrounds.
- Preserve Brass/Champagne accents and all motion/layout behavior.
- Do not change global dark page tokens or internal page shells.

## Architecture

Add hero-scoped CSS custom properties and semantic hero classes. The home section consumes those properties; component markup stops hard-coding dark-theme Tailwind text/border colors.

## Related Code Files

- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/features/home/presentation/scroll-video-hero.tsx`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/features/home/presentation/hero-main-state.tsx`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/features/home/presentation/hero-room-selector.tsx`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/features/home/presentation/hero-brand-state.tsx`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/styles/hero.css`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/styles/shell.css`
- Modify: `/Users/thanhnguyen/Documents/MowStudio/src/features/home/presentation/scroll-video-hero.test.tsx`

## Implementation Steps

1. Define hero background, ink, muted, line, accent, and action tokens under `.home-hero`.
2. Replace the dark atmosphere with a subtle porcelain gradient.
3. Map copy and controls to semantic hero classes.
4. Add a regression assertion for the light hero theme hook.

## Todo List

- [x] Add scoped palette.
- [x] Migrate hero component colors.
- [x] Preserve hover/focus visibility.
- [x] Update focused tests.

## Success Criteria

- All three hero states remain readable in static, animated, mobile, and reduced-motion modes.
- No non-hero page changes color.

## Risks

- Existing white text becomes low contrast. Mitigate by removing all hero-local stone/white utilities found in the audit.
- Header transition may mismatch. Verify the home header boundary visually without altering global shell behavior.

## Security Considerations

Presentation-only change; no data or authorization impact.
