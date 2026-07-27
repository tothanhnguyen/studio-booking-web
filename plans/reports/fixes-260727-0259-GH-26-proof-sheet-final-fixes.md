# Final fix wave — MOW Proof Sheet rebuild (GH-26)

**Status:** DONE

## Commits

| Commit | Type | Covers |
|---|---|---|
| `a7877d0` | fix | A — reword `editorial-pages.css` comment breaking CSS parsing (pre-existing, already committed) |
| `eb54161` | fix | B — ScrollReveal failsafe timer + immediate-reveal-if-in-view + test |
| `08397a2` | fix | C, D — IMP-1 CTA touch targets (2.75rem min-block-size) + IMP-2 `.ui-action .led-status` typography reset |
| `1d7672f` | fix | E — IMP-3 dropped `CropFrame` around booking-wizard form (kept on QR/image frames) |
| `5d9502c` | fix | F — IMP-4 `alt=""` on decorative service thumbnail + test update |
| `cc970c0` | feat | G — IMP-5 wired `.proof-grid` column-rule device into `/studios` and `/studios/[slug]` |
| `4b8d713` | fix | H — IMP-6 `film-strip.tsx` raw `<img>` → `next/image` (150×100, lazy) |
| `9c118d7` | chore | I — stale `.account-ticket` comments (`booking-calendar.tsx`, `proof-admin.css:373`) + `--color-brass`/`--color-sage` → `--color-accent`/`--color-success` |
| `abd0921` | test | e2e date bumps for `room-only-payment.spec.ts` (and 3 already-bumped specs) — shared seeded DB capacity exhaustion, needed for a green full suite |

Note: when I started, most of A–I were already implemented uncommitted in the working
tree (a prior pass had done the work but not committed or fully verified). I reviewed
each diff against the two source reports, confirmed correctness, then split and
committed them as above. Item A was already committed separately (`a7877d0`).

## Fix-by-fix verification

- **A (CSS parse bug):** `grep -rn '\*/' src/styles/*.css` re-run across all CSS files —
  no other mid-text `*/` occurrences found. Confirmed fixed by rendering `/studios` in
  dev mode (200 OK, styles applied).
- **B (ScrollReveal):** added `FAILSAFE_MS = 1500` timer that force-reveals if the
  IntersectionObserver hasn't fired, cleared on reveal/unmount; added an
  already-in-viewport mount check. New fake-timer test added; all 3 original tests
  still pass. Verified live: `/studios` full-page screenshot shows all 3 studio cards
  and `/studios/photo-studio` shows both service rows — no more invisible content.
- **C/D (IMP-1/IMP-2):** verified live — the "Đặt lịch …" primary CTA on the room-detail
  page now renders at normal button size/weight (not 11px mono) with the REC dot intact;
  "XEM CHI TIẾT →" link now has a real hit area.
- **E (IMP-3):** confirmed `CropFrame` is still used for QR/hero/confirmation imagery
  (`room-card.tsx`, `vietqr-payment.tsx`, confirmation page, room hero) — only the
  form-field usage in the wizard was dropped, so `annotation` prop isn't dead code.
- **F (IMP-4):** `alt=""`, matching test updated (kept the `getByTestId("room-visual")`
  assertion, dropped the alt-text assertion).
- **G (IMP-5):** both `.proof-studios-page` and `.proof-room-page` are already
  `position: relative`, so wiring was a pure additive change. Confirmed live —
  vertical column hairlines render across both pages at 1440px.
- **H (IMP-6):** `next/image` with explicit `width={150} height={100}`; `film-strip.tsx`
  is already exercised by `film-strip.test.tsx` (`getByAltText`/`getByRole("list")`),
  no test changes were needed since `next/image` renders a real `<img>` in jsdom (same
  pattern already used by `room-visual.tsx`).
- **I:** both stale comments reworded; `proof-admin.css:389-390` now uses
  `--color-accent`/`--color-success` (values were already identical, so no visual
  change — confirmed by reading `tokens.css`).
- **J (hydration warning):** investigated. Grepped the full `src/` tree for
  `caret-color`/`caretColor`/`typewriter` — zero matches. Read `booking-wizard.tsx` and
  `form-field.tsx` in full; neither sets any inline style on the inputs. **Our code does
  not cause this.** Most likely source is a browser extension (password manager /
  autofill security tooling commonly injects `style="caret-color:transparent"` on
  focused inputs), which is outside the app's control. No fix applied; noting the cause
  per the "otherwise note it" instruction.
- **K (dev-mode render check):** started `ALLOW_TEST_ACTOR=true pnpm dev`, confirmed
  `/studios` returns 200, and screenshotted `/studios` and `/studios/photo-studio` at
  1440×900 via Playwright — column rules visible, all cards/rows visible, LED CTA
  typography correct, film-strip thumbnails rendering. Server killed after (port 3000
  confirmed free).

## Verification

| Gate | Result |
|---|---|
| `pnpm ci:verify` (prisma generate + eslint + tsc + vitest) | **green** — eslint 0 errors / 2 warnings (both pre-existing, in `crop-frame.test.tsx` and `parallax-frame.test.tsx`; the film-strip warning from the review is gone); tsc 0 errors; **vitest 62 files / 189 tests passed** (188 original + 1 new failsafe test) |
| `pnpm build` | **green** — Next.js production build compiles, all 26 routes generated |
| `pnpm exec playwright test` (full suite) | **46 passed, 4 skipped, 0 failed** (50 total). First run had 2 failures in `room-only-payment.spec.ts` (both browser projects) — root cause was the shared, non-reset seeded DB having exhausted the fixture date's booking capacity from prior runs (documented, pre-existing pattern in that spec's own comment), unrelated to this fix wave. Bumped the date (commit `abd0921`) and re-ran clean. |

## Not fixed / out of scope

- **J** — no code fix; root cause is external (see above), not caused by this codebase.
- Everything else in the controller's A–K list was addressed. MIN-1, MIN-9, MIN-10,
  MIN-13 (deferred nits from the review, explicitly marked "defer to follow-up" in that
  report) were left untouched as instructed — not part of this fix wave's scope.

## Unresolved questions

None — the two reports' open questions (IMP-5 wire-vs-delete, IMP-2 intentional dot)
were both resolved by the controller's fix list (wire; keep dot + restore typography).
