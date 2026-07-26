# Phase 03 Task 2 — Implementation Report

## Status

- Implementer: `/root/p03t02_implementer`
- Result: ready for spec/code review
- Git: no stage, commit, push, branch switch, stash, reset, clean, or revert performed

## TDD evidence

### RED

Command:

```text
pnpm vitest run src/features/booking/presentation/booking-wizard.test.tsx
```

Result: expected failure, 1 failed test. The new presentation test could not find `60 phút`, confirming that the existing wizard did not expose service duration/price context.

### GREEN

The wizard now renders the shared progress rail, contact heading, real duration, the exact `vi-VN` formatted `500.000 ₫` price, and a primary shared action. The price assertion uses a no-normalization matcher so the U+00A0 emitted by `Intl.NumberFormat` is checked exactly.

Result: 1 test passed.

## Behavior preservation

- Kept the five steps, their order, numeric indexes, and every existing transition target unchanged.
- Kept availability request unchanged: `/api/availability?serviceId=${serviceId}&date=${date}` with `{ cache: "no-store" }`.
- Kept date/slot handlers, slot state, and empty availability copy unchanged.
- Kept `createBookingAction` input unchanged, including optional empty phone/note normalization.
- Kept failure recovery unchanged: clear loading, expose the action message, and return to step index 2.
- Kept successful redirect unchanged: `/booking/${result.data.bookingId}/payment`.
- The route still performs the same active-service repository query and `notFound` branch; it now passes real `durationMinutes` and `priceAmount` without a client refetch.

## Presentation

- Replaced five equal pills with `BookingProgress`.
- Added an 8/4 desktop transaction composition; mobile orders service context before the active task and keeps horizontal overflow inside the progress rail.
- Added `.booking-window.ui-surface` with `aria-busy`, a single 12px/opacity entrance, and explicit reduced-motion removal.
- Wrapped the four contact controls and date input with `FormField`; existing registration, labels, types, and Zod messages remain intact.
- Applied primary shared actions to all forward buttons and tertiary shared actions to all back buttons.
- Added 48px minimum slot targets, Espresso/Warm-line idle styling, and Champagne/Bone selected styling.
- Extended the seeded guest journey with progress and deposit-context assertions without weakening its booking/redirect assertions.

## Changed files

- `src/app/booking/[id]/page.tsx`
- `src/features/booking/presentation/booking-wizard.tsx`
- `src/features/booking/presentation/booking-wizard.test.tsx`
- `src/styles/forms.css`
- `src/styles/utilities.css`
- `tests/e2e/guest-booking.spec.ts`

## Verification

```text
pnpm vitest run src/features/booking/presentation/booking-wizard.test.tsx
PASS — 1 file, 1 test

pnpm typecheck
PASS — tsc --noEmit

pnpm eslint 'src/app/booking/[id]/page.tsx' src/features/booking/presentation/booking-wizard.tsx src/features/booking/presentation/booking-wizard.test.tsx tests/e2e/guest-booking.spec.ts
PASS

pnpm test
PASS — 48 files, 143 tests
```

The full suite printed the two pre-existing redacted readiness timeout log lines; they remained non-failing. Playwright was intentionally not run at task level per the brief and remains required at the Phase 03 gate.

## Concerns / unresolved questions

- None. Phase-gate browser verification still needs to cover the seeded flow and 375px layout.
