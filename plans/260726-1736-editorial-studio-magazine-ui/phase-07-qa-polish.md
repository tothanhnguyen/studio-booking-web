# Phase 7 — Cross-Page QA and Polish

**Context:** `plan.md` Completion Gate, spec §6 and §8. Runs only after phases 1–6 are complete.
**Status:** Not started

## Task 1: Automated gates

- [ ] `pnpm ci:verify` — PASS (lint, typecheck, full vitest).
- [ ] `pnpm build` — PASS.
- [ ] `pnpm test:integration` against PostgreSQL 18 — PASS.
- [ ] `pnpm test:e2e` (full Playwright, seeded DB) — PASS. Fix regressions at the source (never loosen assertions to pass).

## Task 2: Visual and responsive sweep

Use Playwright MCP or `agent-browser` to capture every route at 1440×900 and 375×812, both motion modes:

- [ ] Routes: `/`, `/studios`, `/studios/photo-studio`, `/studios/voice-podcast-booth`, `/studios/music-studio`, one `/services/[slug]`, full booking flow pages, `/login`, `/register`, `/account/bookings`, one account detail, `/admin` + all admin pages.
- [ ] Per screenshot check: no horizontal overflow at 375px; display type never clips Vietnamese diacritics; grain imperceptible but present on public pages; exactly one dominant capsule/ticket treatment per screen; status always labeled.
- [ ] Image set: side-by-side of all room/brand imagery + hero poster reads as one warm-graded set.
- [ ] Save the screenshot review summary to `plans/reports/` per the session naming pattern.

## Task 3: Interaction and accessibility sweep

- [ ] Keyboard-only pass: header nav → studios → service → full booking → auth → account cancel-zone → admin forms. Visible focus everywhere; no trap.
- [ ] Reduced motion (`emulateMedia`): zero marquee/parallax/reveal movement; all content visible; step transitions instant.
- [ ] Contrast spot-check (AA): body text on Canvas, muted text on Surface, badge labels on their tints, action text on Action.
- [ ] Touch targets ≥44px on booking slots, filters, admin rows at 375px.

## Task 4: Performance spot checks

- [ ] Lighthouse (or Playwright trace) on `/studios` and one room page: CLS < 0.02, LCP image is the graded hero shot with `priority`, no long tasks from scroll handlers (parallax rAF-throttled).
- [ ] `du -h public/media/rooms public/media/brand`: heroes ≤250KB, details ≤150KB.
- [ ] Marquee holds 60fps on a mid-tier device profile (Playwright CPU throttle 4x — no dropped-frame jank visible in trace).

## Task 5: Docs and closeout

- [ ] Update `docs/development-roadmap.md` and `docs/project-changelog.md` (UI pass entry) via docs conventions.
- [ ] Add supersession note to `plans/260715-0031-cozy-dark-ui-system/plan.md` header: "Superseded 2026-07-26 by plans/260726-1736-editorial-studio-magazine-ui/ (phases 3–6 scope absorbed)."
- [ ] Mark all phase files in this plan complete; set plan.md **Status: Complete**.
- [ ] Final commit: `docs: close out editorial studio magazine ui pass`

## Success Criteria

Every item in plan.md Completion Gate is verified with command output or screenshots — not assumed.
