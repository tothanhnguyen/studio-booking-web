# Editorial Studio Magazine UI Pass — Status Report

Date: 2026-07-26 22:42 | Branch: `tnguyen/phase7.2` (not pushed) | Plan: `plans/260726-1736-editorial-studio-magazine-ui/`
Spec: `docs/superpowers/specs/2026-07-26-editorial-studio-magazine-ui-design.md`
Ledger: `.superpowers/sdd/progress.md` | Task reports: `.superpowers/sdd/*-report.md`

## Progress: 5/7 phases done

| Phase | Status | Gate |
|---|---|---|
| 1. Foundation (Fraunces, tokens, editorial.css, 4 motion primitives) | ✅ CLOSED | ci:verify 164/164, build pass |
| 2. Imagery (10 assets derived from hero-theme.mp4 2560×1440) | ✅ CLOSED | all assets review-approved; MAY BE REPLACED when user drops photos into `image-drop/` |
| 3. Public discovery (/studios index, room cover story, service spec sheet) | ✅ CLOSED | ci:verify 167/167, e2e public-catalog+home-hero green |
| 4. Booking ticket (rail, wizard, payment receipt, confirmation) | ✅ CLOSED | ci:verify 168/168, e2e:critical 8/8 |
| 5. Auth + account | 🟡 2/4: auth split ✅, ticket rail ✅; **NEXT: task 3 booking detail**, then task 4 gate | — |
| 6. Admin refinement (4 tasks) | ⬜ not started | — |
| 7. Cross-page QA (visual sweep, a11y, perf, docs closeout) | ⬜ not started | — |

Full e2e suite currently GREEN: 46 pass / 4 expected-skip / 0 fail. 9 pre-existing failures (predating this pass, from the uncommitted baseline) were root-caused and fixed test-only (commits 2108306, f4528b0, 94b27c7, 7eefff8).

## Commits (33 total, baseline 66529c2 → e334cea)

All task work is committed per-task with conventional messages; every task passed an adversarial review (spec + quality), fixes re-reviewed until Approved. Working tree: only `.gitignore` modified (added `image-drop/`) — uncommitted, safe to commit as `chore: ignore image drop folder`.

## Execution protocol (for whoever continues)

Subagent-driven: brief via `scripts/task-brief`, fresh implementer per task, review package via `scripts/review-package BASE HEAD`, adversarial reviewer, fix→re-review loop. Briefs at `.superpowers/sdd/p{N}-task-{M}-brief.md`. Remaining phase files: `phase-05-auth-account.md` (task 3, gate), `phase-06-admin-refinement.md`, `phase-07-qa-polish.md`.

## Pending user items

1. **Photos:** user will drop real photos into `image-drop/` (gitignored). Needed: 3 room heroes + 6 details + 1 brand; ≥1200px wide preferred. On arrival: grade to Canvas `#E7E1D8`, crop to slots (heroes 4:3-ish ≥960px, details ≥600px), webp q82, overwrite `public/media/rooms/*` + `public/media/brand/auth-statement.webp` (filenames stable — zero code changes).
2. **Gemini key** in `~/.claude/.env` is free-tier (zero image quota) — key was pasted in chat; recommend rotating it.
3. Push/PR timing is user's call.

## Deferred Minors (triage at P7 final review)

- ScrollReveal: useSyncExternalStore alternative; eslint-disable comment style.
- ParallaxFrame: no listener re-attach on resize across 768px (accepted by design).
- RoomVisual: data-variant not clamped on fallback slug; no unknown-slug+variant test.
- Room story: min-block-size clamp on `-hero-visual` vs `-hero` selector.
- Service sheet: SectionMarker 03 buffer-time copy needs design sign-off.
- Booking rail: circle marker vs "pill" literal reading.
- Payment: three stacked `.ui-surface` cards ("triple chrome") — visual QA at P7.
- Account rail: `resolveRoomMaterial` string heuristic duplicates room-visual mapping (root cause: repo lacks roomSlug in customer booking query — out of presentation scope).
- No component tests for auth-shell / account rail (pre-existing gap pattern).
- Podcast pod grade slightly warmer than poster — eyeball in deployed UI.

## Environment notes

- Local dev Postgres is persistent: repeated e2e runs exhaust slots on hardcoded test dates → guest-claim flakes locally (NOT in CI — CI uses fresh postgres:18 container per run). Cleanup approach documented in `.superpowers/sdd/p4-e2e-fix-report.md`.
- `magick`/`ffmpeg`/`cwebp` installed during this session (brew).

## Unresolved questions

- Replace derived imagery with user photos when provided (keep same filenames).
- Rotate the pasted Gemini API key?
