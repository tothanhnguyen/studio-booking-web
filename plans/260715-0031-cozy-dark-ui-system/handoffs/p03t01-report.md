# Phase 03 Task 1 Implementation Report

## Agent

- Implementer: `/root/p03t01_implementer`
- Branch: `tnguyen/phase7.2`
- Git ownership: no stage, commit, push, switch, stash, reset, clean, or revert performed

## TDD evidence

- RED: `pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx`
  - Exit code: `1`
  - Expected cause: Vite failed to resolve the missing `./booking-progress` module.
- GREEN: same focused command after the minimal implementation.
  - Exit code: `0`
  - Result: `1` file and `1` test passed.

## Changed files

- Created `src/app/booking/layout.tsx`.
- Created `src/features/booking/presentation/booking-progress.tsx`.
- Created `src/features/booking/presentation/booking-progress.test.tsx`.
- Modified the untracked shared `src/styles/shell.css` created by the earlier foundation phase.
- Modified the untracked shared `src/styles/utilities.css` created by the earlier foundation phase.

## Implementation choices

- `BookingProgress` uses the exact stable `BookingProgressProps` interface and a named semantic `ol` with `li.booking-progress__step` children.
- Step state is calculated from the zero-based `currentStep`; only the active step receives `aria-current="step"`.
- The numeric one-based position uses the shared mono treatment and the label remains a separate span.
- The progress visual is a single contiguous top rail: Warm-line upcoming segments, Brass complete segments, and Champagne active segment. No pill-per-step composition was added.
- The progress list owns horizontal scrolling with inline overscroll containment; the transaction main/page remain clipped against horizontal overflow.
- `BookingLayout` is a render-only marker and performs no fetch or domain work.
- The transaction-shell `:has()` selectors hide desktop room links, mobile `/studios*` links, and the footer while preserving the wordmark and guest/customer/admin account actions.

## Verification

- `pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx`: PASS (`1/1`).
- `pnpm typecheck`: PASS.
- `pnpm eslint src/app/booking/layout.tsx src/features/booking/presentation/booking-progress.tsx src/features/booking/presentation/booking-progress.test.tsx`: PASS.
- `pnpm test`: PASS (`47` files, `141` tests).
- The full suite emitted the two pre-existing redacted `readiness.check_failed` timeout logs; they remain non-failing and match baseline behavior.

## Concerns

- `shell.css` and `utilities.css` already exceed the preferred 200-line guideline because shared phase styling is intentionally consolidated there; this task added only focused transaction/progress rules and did not split shared files outside its ownership.
- No unresolved product or implementation questions.

## Handoff

- Intended user-managed commit: `feat: add focused booking transaction shell`

## Reviewer fix response

- Finding 1 — duplicate step labels produced duplicate React keys:
  - Added a regression test rendering two `Ngày` labels and asserting React emits no duplicate-key warning.
  - RED evidence: focused test failed `1/2` with `Encountered two children with the same key, 'Ngày'`.
  - Fixed list identity with the stable static-order key `${index}-${step}`; step labels may now repeat without warning.
- Finding 2 — desktop divider remained after room navigation was hidden:
  - Added `.site-nav-divider` to the transaction-shell hidden selector group so no orphan line remains.
- Post-fix verification:
  - Focused progress test: PASS (`2/2`).
  - `pnpm typecheck`: PASS.
  - Focused ESLint: PASS.
- No Git operation was performed and no concerns remain from these findings.
