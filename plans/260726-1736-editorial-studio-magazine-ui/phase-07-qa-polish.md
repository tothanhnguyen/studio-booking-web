# Phase 7 — Cross-Page QA and Polish

**Context:** `plan.md` Completion Gate, spec §6 and §8. Runs only after phases 1–6 are complete.
**Status:** In progress — automated gates (Task 1) verified as part of the final-branch-review fix pass (see `plans/reports/fixes-260727-0005-GH-26-final-review-fixes.md`); Tasks 2–4 (visual/responsive sweep, interaction/a11y sweep, performance spot checks) were never run and remain open. Docs closeout (Task 5) partially done: supersession notes added, phase files 01–06 checkbox-audited against the ledger; `docs/development-roadmap.md` and `docs/project-changelog.md` do not exist in this repo (the project's actual convention is `docs/journals/`, which already has an entry for this pass: `docs/journals/260726-2350-editorial-studio-magazine-ui-pass.md`).

## Task 1: Automated gates

- [x] `pnpm ci:verify` — PASS (lint, typecheck, full vitest). 173/173 (see `plans/reports/fixes-260727-0005-GH-26-final-review-fixes.md`).
- [x] `pnpm build` — PASS.
- [x] `pnpm test:integration` against PostgreSQL 18 — PASS. 29/29 (via `docker compose -f docker-compose.test.yml up -d --wait` + `prisma migrate deploy`).
- [x] `pnpm test:e2e` (full Playwright, seeded DB) — PASS. 46 passed / 4 skipped / 0 failed, both `chromium` and `mobile-chrome` projects. Two pre-existing flaky dates (`assisted-lifecycle.spec.ts`, `room-only-payment.spec.ts`) had silently saturated from repeated prior runs against the shared non-reset DB — root-caused and fixed by moving to fresh date pairs, not by loosening any assertion.

## Task 2: Visual and responsive sweep

Use Playwright MCP or `agent-browser` to capture every route at 1440×900 and 375×812, both motion modes:

- [ ] Routes: `/`, `/studios`, `/studios/photo-studio`, `/studios/voice-podcast-booth`, `/studios/music-studio`, one `/services/[slug]`, full booking flow pages, `/login`, `/register`, `/account/bookings`, one account detail, `/admin` + all admin pages. (Not run in the final-review fix pass — no screenshot sweep performed.)
- [ ] Per screenshot check: no horizontal overflow at 375px; display type never clips Vietnamese diacritics; grain imperceptible but present on public pages; exactly one dominant capsule/ticket treatment per screen; status always labeled. (Open — depends on the sweep above.)
- [ ] Image set: side-by-side of all room/brand imagery + hero poster reads as one warm-graded set. (Open.)
- [ ] Save the screenshot review summary to `plans/reports/` per the session naming pattern. (Open.)

## Task 3: Interaction and accessibility sweep

- [ ] Keyboard-only pass: header nav → studios → service → full booking → auth → account cancel-zone → admin forms. Visible focus everywhere; no trap. (Not run — no dedicated keyboard-only pass performed.)
- [ ] Reduced motion (`emulateMedia`): zero marquee/parallax/reveal movement; all content visible; step transitions instant. (Not run as an automated/manual sweep; the admin-specific violation of this bar was fixed at the code level in this pass — see final-review finding C1.)
- [ ] Contrast spot-check (AA): body text on Canvas, muted text on Surface, badge labels on their tints, action text on Action. (The one known violation (`--color-text-subtle` on Canvas, finding I1) was fixed at the code level in this pass; no fresh full spot-check was run afterward.)
- [ ] Touch targets ≥44px on booking slots, filters, admin rows at 375px. (The four known sub-44px controls (finding I2) were fixed at the code level in this pass; no fresh full sweep at 375px was run afterward.)

## Task 4: Performance spot checks

- [ ] Lighthouse (or Playwright trace) on `/studios` and one room page: CLS < 0.02, LCP image is the graded hero shot with `priority`, no long tasks from scroll handlers (parallax rAF-throttled). (Not run in this pass.)
- [ ] `du -h public/media/rooms public/media/brand`: heroes ≤250KB, details ≤150KB. (Confirmed as in-budget by the final branch review; see report §2 I7 — not re-measured in this fix pass.)
- [ ] Marquee holds 60fps on a mid-tier device profile (Playwright CPU throttle 4x — no dropped-frame jank visible in trace). (Not run in this pass.)

## Task 5: Docs and closeout

- [ ] Update `docs/development-roadmap.md` and `docs/project-changelog.md` (UI pass entry) via docs conventions. (Neither file exists anywhere in this repo — the project's actual docs convention is `docs/journals/`, which already carries an entry for this pass: `docs/journals/260726-2350-editorial-studio-magazine-ui-pass.md`. Left open rather than fabricating new top-level docs files outside the project's established structure.)
- [x] Add supersession note to `plans/260715-0031-cozy-dark-ui-system/plan.md` header: "Superseded 2026-07-26 by plans/260726-1736-editorial-studio-magazine-ui/ (phases 3–6 scope absorbed)." Also added to that plan's `phase-03-booking-payment.md`, the file this plan's phase-04 gate specifically named.
- [ ] Mark all phase files in this plan complete; set plan.md **Status: Complete**. (Phase files 01–06 checkbox-audited against the ledger and marked Complete with honest gaps noted; this file, phase-07, itself still has open items above, so plan.md Status is set to reflect that rather than "Complete".)
- [x] Final commit: `docs: close out editorial studio magazine ui pass`

## Success Criteria

Every item in plan.md Completion Gate is verified with command output or screenshots — not assumed.
