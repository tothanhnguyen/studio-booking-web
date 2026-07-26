# Phase 01 Task 1 Report — Font and CSS Token Foundation

## Status

DONE

Implemented the approved font registration, warm-dark CSS tokens, stylesheet split, base accessibility behavior, and shell characterization coverage. Existing shell and hero rules were preserved, and no Git/index operation was performed.

## Files changed

- `src/app/layout.tsx`
  - Registered `Plus_Jakarta_Sans` and `IBM_Plex_Mono` with the exact approved subsets, weights, display mode, and CSS variable names.
  - Applied both generated font-variable classes to `<body>`.
- `src/app/layout.test.tsx`
  - Added deterministic Next font mocks, current-actor mock, isolated sign-out action mock, and the root body font-class assertion.
- `src/app/globals.css`
  - Replaced the monolithic stylesheet with the required import-only entrypoint and exact import order.
- `src/styles/tokens.css`
  - Added all approved color, radius, motion, and content-width tokens.
- `src/styles/base.css`
  - Moved reset/document/body rules and added token-backed body colors/font, global focus-visible behavior, and reduced-motion behavior.
- `src/styles/shell.css`
  - Moved all existing header/app-shell rules without declaration changes.
- `src/styles/hero.css`
  - Moved every existing `.hero-*` rule without declaration changes; compacted only blank lines to keep the file below 200 lines.
- `src/styles/forms.css`
  - Added the imported form-primitives module placeholder.
- `src/styles/utilities.css`
  - Added the imported shared-utilities module placeholder.
- `src/components/app-shell.test.tsx`
  - Added the required `.app-shell`, `main.app-main`, and home-link characterization assertions.

## TDD evidence

### RED

Command:

```bash
pnpm vitest run src/app/layout.test.tsx src/components/app-shell.test.tsx
```

The first attempt exposed unrelated server-environment evaluation through `signOutAction` (suite load error), so a narrow action mock was added to isolate the layout. The genuine RED rerun then exited 1 with:

- `src/app/layout.test.tsx`: 1 expected assertion failure because `document.body` had neither `font-sans-variable` nor `font-mono-variable`.
- `src/components/app-shell.test.tsx`: passed, 3/3 tests.

This established that the new test failed specifically because the root font implementation was missing.

### GREEN

After the minimal font implementation, the same command exited 0:

- Test files: 2 passed.
- Tests: 4 passed.

After stylesheet refactoring/whitespace compaction, the focused command was rerun and remained 4/4 passing.

## Verification

Required focused verification:

```bash
pnpm vitest run src/components/app-shell.test.tsx src/features/home/presentation/scroll-video-hero.test.tsx && pnpm typecheck
```

Result: exit 0; 2 test files passed, 7 tests passed, and `tsc --noEmit` passed.

Required one-time full suite:

```bash
pnpm test
```

Result: exit 0; 40 test files passed, 128 tests passed. The run emitted two readiness-check error log entries for intentionally unreachable/redacted connection attempts, but they did not fail any test.

Final fresh verification:

```bash
pnpm vitest run src/app/layout.test.tsx src/components/app-shell.test.tsx src/features/home/presentation/scroll-video-hero.test.tsx && pnpm typecheck
```

Result: exit 0; 3 test files passed, 8 tests passed, and `tsc --noEmit` passed.

Preservation audit results:

- `shell_rules_preserved=yes` via direct comparison with the original `globals.css` shell block.
- `hero_rules_preserved=yes` via whitespace-normalized comparison with both original hero blocks.
- `src/styles/hero.css` is 199 lines.

## Self-review

- Confirmed the `globals.css` imports exactly match the required order.
- Confirmed all required public color tokens and both generated font variables are present.
- Confirmed the base layer includes the approved focus-visible and reduced-motion declarations.
- Confirmed no existing shell or hero declaration/selector was removed or changed.
- Confirmed the shell characterization test covers `.app-shell`, `main.app-main`, and the home link contract.
- Confirmed no commit, stage, push, branch switch, stash, reset, or other Git/index mutation occurred.
- Confirmed no plan/ledger file was edited other than this report.

## Concerns

- The passing full test run includes two readiness-check error logs from unreachable/redacted connection scenarios; this is test-output noise rather than a failure introduced by this task.

## Unresolved questions

None.
