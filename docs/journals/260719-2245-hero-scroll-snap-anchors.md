---
date: 2026-07-19
session: hero-scroll-snap-anchors
---

# Hero Scroll Snap Anchors and Hydration Race

## Context

The hero needed deterministic section snapping without changing the mobile or reduced-motion fallback. Scene timing and frame selection had drifted into separate assumptions, making the desktop interaction harder to reason about and easier to break.

## What Happened

We centralized the desktop sequence in `HERO_SCENES`: snap progress `[0, .48, 1]` and frame anchors `[0, 32, 56]`. `mainEnd` now lands at the `.74` midpoint, and preloading stops at frame 56 instead of pulling frames the interaction never reaches. Snapping is section-scoped, interruptible, and driven through GSAP. Mobile and reduced-motion paths still use the unchanged poster.

Review then found a hydration readiness race. The E2E flow could observe the hero before snapping was actually ready, so passing behavior depended on timing rather than an explicit contract. We fixed that with `data-hero-snap-ready` and strengthened the assertions to cover snapping in both directions. The test suite passed after the fix.

## Reflection

The brutal truth is that we built a timing-sensitive interaction and initially left readiness implicit. That was sloppy. A browser test that happens to wait long enough is not proof that hydration and interaction setup are synchronized. Finding this in review was frustrating because the visual result looked finished while the actual lifecycle contract was still missing.

## Decisions Made

| Decision | Rationale | Rejected alternative |
|---|---|---|
| Keep progress and frame anchors in `HERO_SCENES` | One source of truth exposes timing changes clearly | Scattered constants were rejected because they caused silent drift |
| Preload only frames 0–56 | Matches reachable anchors and avoids wasted payload/work | Preloading the entire sequence was rejected as unnecessary |
| Use explicit `data-hero-snap-ready` readiness | Makes hydration state observable and testable | Fixed waits were rejected because they hide races |
| Preserve poster fallbacks | Avoids forcing desktop animation behavior onto constrained users/devices | Reusing GSAP snapping everywhere was rejected for accessibility and stability |

## Next Steps

- Frontend owner: keep future scene timing changes inside `HERO_SCENES` and update bidirectional E2E coverage in the same change, before merge.
- Reviewer: reject any hero test that replaces the readiness signal with a timeout, during the next review.
- QA owner: recheck desktop forward/reverse snapping plus unchanged mobile and reduced-motion poster behavior before the next release.
