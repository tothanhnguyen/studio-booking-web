# Phase 01 Task 2 Report — Shared Presentation Primitives

## Status

Complete. Added the requested shared component contracts, semantic presentation primitives, focused tests, and cozy-dark CSS treatments. All changes are unstaged; no commit, push, branch, stash, reset, or index operation was performed.

## Scope delivered

- `ActionVariant` and `actionClassName`, including primary defaults and compact variants.
- `PageHeadingProps` and semantic `PageHeading` with eyebrow, description, heading ID, and default/large sizing.
- `FormFieldProps` and semantic `FormField` with an associated label, mutually exclusive hint/error output, and alert semantics for errors.
- `EmptyState` with title, description, and optional `ReactNode` action.
- Action, page-heading, surface, facts-rail, and empty-state styles in `utilities.css`.
- Field, native input/select/textarea, focus, invalid, disabled, hint, and error styles in `forms.css`.

## RED evidence

Command:

```bash
pnpm vitest run src/components/ui/page-heading.test.tsx src/components/ui/form-field.test.tsx src/components/ui/empty-state.test.tsx
```

Result: expected failure, exit 1. All three suites failed during import resolution because `./action`, `./page-heading`, `./form-field`, and `./empty-state` did not yet exist. No production primitive code existed before this run.

## GREEN evidence

Command:

```bash
pnpm vitest run src/components/ui
```

Result: exit 0; 3 test files passed, 4 tests passed.

The fourth focused test covers the exported `actionClassName` function so each newly added behavior-bearing function has test-first coverage.

## Verification

```bash
pnpm eslint src/components/ui/action.ts src/components/ui/page-heading.tsx src/components/ui/page-heading.test.tsx src/components/ui/form-field.tsx src/components/ui/form-field.test.tsx src/components/ui/empty-state.tsx src/components/ui/empty-state.test.tsx
pnpm typecheck
pnpm test
```

Results:

- Focused ESLint: passed, no findings.
- TypeScript (`tsc --noEmit`): passed.
- Full Vitest suite: exit 0; 43 files passed, 132 tests passed.

The full suite printed two redacted `readiness.check_failed` error events while its existing readiness error-path tests ran. These did not fail any test and exposed no credentials; the suite still completed successfully.

## Files changed

- Created `src/components/ui/action.ts`
- Created `src/components/ui/page-heading.tsx`
- Created `src/components/ui/page-heading.test.tsx`
- Created `src/components/ui/form-field.tsx`
- Created `src/components/ui/form-field.test.tsx`
- Created `src/components/ui/empty-state.tsx`
- Created `src/components/ui/empty-state.test.tsx`
- Modified `src/styles/forms.css`
- Modified `src/styles/utilities.css`
- Created this report

## Self-review

- Confirmed stable plan signatures for `ActionVariant`, `actionClassName`, `PageHeadingProps`, and `FormFieldProps`.
- Confirmed required DOM structures and root class names match the brief.
- Confirmed Champagne-on-Void primary treatment, Warm-line secondary treatment, and restrained Clay danger treatment.
- Confirmed fields meet the 48px minimum height and preserve the global Brass focus language.
- Confirmed each implementation/test/style file stays below 200 lines (largest: `utilities.css`, 137 lines).
- Confirmed the task boundary: only the nine brief files plus this explicitly requested report were touched.
- Did not spawn review/test agents because the task explicitly prohibited subagents; performed the review and verification directly.

## Concerns / unresolved questions

- No blocking concerns.
- CSS received static/type/test verification but no browser screenshot comparison in this task; downstream page migrations will provide integration-level visual coverage.
- Existing full-suite readiness error-path tests emit redacted error logs despite passing.

## Reviewer Fixes

### Files changed

- `src/styles/utilities.css`
  - Raised compact action minimum height from `2.5rem` (40px) to `2.75rem` (44px).
  - Made `.facts-rail` a single column with block dividers by default.
  - Enabled auto-fit multi-column layout and inline dividers at `min-width: 640px`.
- `src/styles/forms.css`
  - Replaced the 1.40:1 Warm-line field border with a task-local Brass/Warm-line mix.
  - Raised placeholder opacity from `0.72` to `0.78`.
  - Removed the local `outline: none`, allowing the global 2px Brass `:focus-visible` indicator to apply.
- `plans/260715-0031-cozy-dark-ui-system/handoffs/p01t02-report.md`
  - Added this review-fix evidence.

No approved token value was changed.

### Contrast calculations

Calculations use WCAG relative luminance and `(Llighter + 0.05) / (Ldarker + 0.05)`:

- Field boundary: `color-mix(in srgb, #d9bf83 40%, #39332c)` resolves to approximately `rgb(121 107 79)`, which is **3.36:1** against Espresso `#1c1917` (minimum: 3:1).
- Placeholder: Smoke `#a8a29e` at `0.78` opacity over Espresso composites to approximately `rgb(137 132 128)`, which is **4.73:1** against Espresso (minimum: 4.5:1).
- Keyboard focus: Brass `#d9bf83` is **9.77:1** against Espresso and **11.21:1** against Void. The preserved global indicator is `2px solid` with a `3px` offset and applies only via `:focus-visible`.

### RED / GREEN CSS guard

The pre-fix source assertion exited 1 at the first unmet condition:

```text
AssertionError [ERR_ASSERTION]: compact action must be at least 44px
```

The post-fix guard checked the compact height, field border composition, placeholder opacity, absence of the overriding local outline reset, presence of the global focus-visible ring, mobile facts column, and desktop breakpoint:

```bash
node - <<'NODE'
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = fs.readFileSync('src/styles/base.css', 'utf8');
const forms = fs.readFileSync('src/styles/forms.css', 'utf8');
const utilities = fs.readFileSync('src/styles/utilities.css', 'utf8');
assert.match(utilities, /\.ui-action--compact\s*{[^}]*min-height:\s*2\.75rem/s);
assert.match(forms, /border:\s*1px solid color-mix\(in srgb, var\(--color-brass\) 40%, var\(--color-warm-line\)\)/);
assert.match(forms, /::placeholder\s*{[^}]*opacity:\s*0\.78/s);
assert.doesNotMatch(forms, /:focus\s*{[^}]*outline:\s*none/s);
assert.match(base, /:focus-visible\s*{[^}]*outline:\s*2px solid var\(--color-brass\)/s);
assert.match(utilities, /\.facts-rail\s*{[^}]*grid-template-columns:\s*1fr/s);
assert.match(utilities, /@media \(min-width:\s*640px\)[\s\S]*\.facts-rail\s*{[^}]*repeat\(auto-fit/s);
console.log('Reviewer CSS assertions passed (7/7)');
NODE
```

Output: `Reviewer CSS assertions passed (7/7)`; exit 0.

### Required commands and outputs

```bash
pnpm vitest run src/components/ui
```

Output: 3 test files passed, 4 tests passed; exit 0.

```bash
pnpm typecheck
```

Output: `$ tsc --noEmit`; no diagnostics; exit 0.

```bash
pnpm eslint src/components/ui
```

Output: no lint findings; exit 0. ESLint does not lint CSS in this repository, so the focused component scope plus the explicit CSS source guard above were used.

### Reviewer-fix concerns

- No blocking concerns.
- Browser-level visual regression coverage remains deferred to downstream page integration, as noted above.
