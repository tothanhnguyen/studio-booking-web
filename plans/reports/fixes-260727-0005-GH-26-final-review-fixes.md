# Final Branch Review Fixes — Editorial Studio Magazine UI Pass

**Date:** 2026-07-27
**Source report:** `plans/reports/review-260726-2343-GH-26-final-branch-review.md`
**Branch:** `tnguyen/phase7.2`

## Status: DONE — all findings fixed, full verification green

## Commits

| Commit | Type | Covers |
|---|---|---|
| `f1c282c` | fix | C2, I1, I2, I5, I6 (CSS) — contrast, touch targets, marquee seam, tear-line override, auth marquee light-on-dark override |
| `2f7dc58` | feat | I6 (TSX) — marquee accent on auth brand panel |
| `bdf7a85` | fix | C1, I9 (partial) — admin booking detail scroll-reveal gate + localized payment/refund labels |
| `62b01ac` | fix | I9 (partial) — payment-status.tsx localized booking status, dropped duplicate raw payment row |
| `55b85ee` | fix | I3 — restored catch-all form error in service-form.tsx / room-form.tsx |
| `454dcf7` | fix | I4 — labeled deposit column in booking-list.tsx |
| `4bccc67` | test | I9 test updates + unrelated flaky-date fix in assisted-lifecycle.spec.ts / room-only-payment.spec.ts |
| `65321ad` | docs | I7 — spec §4 accepted-deviation note |
| `187d0ae` | docs | I8 — plan/phase-file checkbox audit |

## What was fixed

**C1** — `booking-detail.tsx`: admin variant now renders a `PlainSection` passthrough instead of `ScrollReveal`; account variant unchanged. Also fixed the policy section's hardcoded `className="account-detail-section"` to use `sectionClassName`. Added `booking-detail.test.tsx` asserting `variant="admin"` renders zero `.scroll-reveal` nodes and the account variant still does.

**C2** — Deleted the unscoped `.booking-summary` block (`editorial-pages.css:358-372`). Verified by inspection: only `.confirmation-receipt > .booking-summary` (already correctly scoped) remains, so `/booking/[id]/payment`'s `BookingSummary` now gets plain, uncontested `.ui-surface` chrome (`border: 1px solid`, full padding).

**I1** — Swapped `.studio-index-row__meta`, `.auth-split-wordmark`, `.marquee-track > span` from `--color-text-subtle` to `--color-text-muted` (5.87:1 on Canvas vs. 3.82:1). Token itself untouched, per the controller decision.

**I2** — Added `min-height: 2.75rem` to `.admin-text-action`, `.account-detail-danger-action` (+ `display:inline-flex; align-items:center`), `.account-filters-select`, and `.admin-catalog-summary` (+ `padding-block: 0.5rem` so the whole `<summary>` row is the target, and `align-items: center` since the row now has vertical room). Standardized `.admin-nav-mobile-select` from `44px` to `2.75rem` for unit consistency. No remaining `44px` in the styles directory.

**I3** — Restored a residual `role="alert"` error block above the result banner in both forms, covering the unmapped hidden `id`/`currency` (service) and `id`/`timezone` (room) fields.

**I4** — Deposit cell in `booking-list.tsx` is now a two-line cell (`Cọc 30%` label + mono amount), matching the existing two-line cell pattern used by the customer and service/room columns in the same row grid.

**I5** — `.marquee-track { gap: 0 }`; spacing comes solely from each span's `padding-inline-end: 2.5rem`, so `translateX(-50%)` now lands on an identical frame (track width is exactly 2× one strip).

**I6** — Added `<Marquee items={["Photo Studio", "Podcast Booth", "Music Studio", "MowStudio"]} />` inside `.auth-split-brand-overlay`. `Marquee` is `aria-hidden` by design. Because the overlay is a dark gradient with light text, added a scoped override (`.auth-split-brand-overlay .marquee` / `.marquee-track > span`) so the track isn't rendered in the page's dark-on-light default (which would be invisible against the overlay).

**I7** — Added a dated, one-sentence accepted-deviation note to spec §4 documenting the 960px hero photography (vs. the ≥1920w line) and its rationale.

**I8** — Audited all 7 phase files against `.superpowers/sdd/progress.md`:
- Phases 01–06: ticked steps with clear ledger/commit evidence; left the phase-gate "manually check" / "Visual QA" / "Lighthouse" bullets **unchecked** with a one-line note where no dedicated pass was ever recorded (several of these notes now explicitly flag that they *would have* caught C1/I1/I2/I6 had they been run — they weren't).
- Added the phase-04-mandated supersession note to the old `260715-0031-cozy-dark-ui-system` plan: its `plan.md` header and, specifically, its `phase-03-booking-payment.md` (the file phase-04's gate names).
- Phase-07: ticked Task 1 (automated gates) now that `ci:verify`, `build`, `test:integration`, and full `test:e2e` all verify green (counts below). Left Tasks 2–4 (visual/responsive sweep, interaction/a11y sweep, performance spot checks) **unchecked** — they were not run in this pass. Left the `docs/development-roadmap.md` / `docs/project-changelog.md` bullet **unchecked with a note**: neither file exists anywhere in this repo; the project's actual docs convention is `docs/journals/`, which already has an entry for this UI pass.
- Updated `plan.md` Status to reflect this honestly (not "Complete" — Phase 7 sweeps remain open).

**I9** — `payment-status.tsx`: paymentStatus's raw-enum `<dl>` row was a true duplicate of the already-localized badge above it, so it was removed; bookingStatus keeps its row but now renders a localized label instead of the raw enum. `booking-detail.tsx`: paymentStatus and refundStatus rows (no other localized display exists for these on that page) now render localized labels via new `paymentStatusLabel` / `refundStatusLabel` maps. Updated `tests/e2e/assisted-lifecycle.spec.ts` and `tests/e2e/room-only-payment.spec.ts` in the same commit to assert the new localized text instead of the raw enum strings.

## Unplanned fix: two flaky/failing e2e specs (root-caused, not a code regression)

`assisted-lifecycle.spec.ts` and `room-only-payment.spec.ts` failed on first full-suite run (`Test timeout ... waiting for locator('button[aria-pressed]').first()`). Root-caused via direct `psql` inspection of the seeded Supabase Postgres: both specs use **fixed calendar dates** against the shared "Photo Studio" room, and both paths leave the created booking permanently `CONFIRMED` (never cancelled), so every prior run of the suite during this session added one more booking to the same fixed date. The room's working-day capacity (4 bookings/day at this service's duration+buffer) was exhausted by bookings from earlier runs today, so no availability slot button rendered and the test timed out. Confirmed via the `customerEmail` values on the stale rows (`assisted-chromium@example.com`, etc. — synthetic test fixtures created today) and by contrast with the same suite's "reject" test, whose date never saturates because rejecting a booking cancels it, freeing the slot.

Deleting the stale rows was blocked by the sandbox's destructive-action classifier, so the fix was to move both specs to fresh, verified-empty date pairs (`2027-08-04/05` and `2027-09-01/02` respectively) — no assertion was loosened. This is unrelated to C1/C2/I1–I9 but was required to get a fully green verification run and is the same class of fragility already flagged in the ledger for this suite (fixed webhook event IDs colliding across runs, fixed there previously by scoping IDs to the booking).

## Verification summary

- `pnpm ci:verify` (prisma generate, eslint, tsc --noEmit, vitest run): **173/173 pass** (168 baseline + 5 new tests: 3 in `booking-detail.test.tsx`, 2 in `payment-status.test.tsx`).
- `pnpm build`: **pass**.
- `pnpm test:integration` (against a local `docker-compose.test.yml` PostgreSQL 18, migrated via `prisma migrate deploy`): **29/29 pass**.
- `pnpm exec playwright test` (full suite, `chromium` + `mobile-chrome`): **46 passed / 4 skipped / 0 failed**.

## Self-review for scope creep

Reviewed the full diff (`git diff ac6880a..HEAD`). Every change traces to a named finding (C1/C2/I1–I9) or the flaky-date fix required to reach a green e2e run. No unrelated refactors, no touched route/domain/auth/API files (confirmed: only `src/styles/*.css`, `src/features/*/presentation/*.tsx`, `tests/e2e/*.spec.ts`, docs/spec/plan markdown). Minor findings (M1–M21) and the deferred-minors triage from the source report were intentionally left untouched — out of scope for this fix pass.

## Findings not fixed, and why

None of C1, C2, I1–I9 were left unfixed. The only intentionally-open items are the parts of **I8** that describe work never performed rather than a defect to fix:
- Phase 7 Tasks 2–4 (visual/responsive sweep, interaction/a11y sweep, performance spot checks) — genuinely not run in this pass; left open with notes rather than fabricating results.
- `docs/development-roadmap.md` / `docs/project-changelog.md` — these files do not exist anywhere in the repository (the project uses `docs/journals/` instead, which already has an entry for this UI pass). Creating brand-new top-level docs files outside the project's established structure was judged out of scope and against the "don't create new files unless necessary" rule; left open with a note explaining the discrepancy rather than fabricating them.
