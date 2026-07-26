---
date: 2026-07-19
session: hero-media-refresh
---

# Hero Media Refresh Removed the Baked-In Logo

**Date**: 2026-07-19 13:55  
**Severity**: Medium  
**Component**: Hero media pipeline  
**Status**: Resolved

## What Happened

We replaced the hero media derived from `/Users/thanhnguyen/Desktop/new.mp4`, a 1280x720 H.264 source running at 24 fps for 10.005 seconds. The source contained a static sparkle logo at `x=1128, y=566, w=72, h=68`. A clean delivery master, `new-2k-no-logo.mp4`, was produced at 2560x1440 using H.264 CRF 17 while copying the AAC audio.

## The Brutal Truth

The logo was baked into the new source, so removing it once in the master-to-sequence pipeline was safer than touching 96 derived frames independently. Regenerating the full sequence kept motion and treatment consistent, but the payload increase is material: 4.24 MB, 41% above the HEAD baseline.

## Technical Details

Frames were regenerated from seconds 2–10 at 12 fps using a centered 4:3 crop: 96 WebPs at 1440x1080, quality 90. The poster is an exact copy of frame 1. Prior modified frames were backed up to a ZIP on the Desktop before replacement. Vitest, typecheck, and Playwright all passed.

## What We Tried

We chose a full sequence regeneration from the logo-free 2K master. We rejected continuing to patch the prior frames because it would preserve inconsistent manual history, and rejected retaining the 16:9 framing because the runtime sequence contract is centered 4:3.

## Root Cause Analysis

The replacement source was 720p and contained a baked-in watermark. Both issues needed to be handled before deriving the website assets. Upscaling improves delivery resolution, but it cannot invent true source detail; 2560x1440 dimensions do not turn the original into native 2K footage.

## Lessons Learned

Validate source cleanliness, crop contract, and payload before generating dozens of derived assets. Keep one reproducible master-to-sequence path instead of manually repairing outputs.

## Hero Background Follow-up

The replacement frames supersede the earlier flat `#F3F1EC` rematte with a warm taupe/gray vignette. The hero atmosphere now follows the sampled frame palette (`#8B847C`, `#ACA89F`, `#B9B3AD`, `#C1BBB6`), and the home header is transparent so it shares the same backdrop without a separate color band. Foreground tokens were darkened where needed to preserve readable contrast. Tests, the production build, and browser visual QA passed. A residual soft bright field remains baked into the source frames and cannot be removed by the page-level background treatment.

## Next Steps

- Media owner: retain the Desktop backup until deployment sign-off, then archive or remove it intentionally.
- Frontend owner: review whether the 41% payload increase is acceptable before the next merge.
- QA owner: rerun Vitest, typecheck, and Playwright after any further media replacement.
