# Phase 03 Task 2 — Booking Wizard

## Ownership and safety

- Implementer: `/root/p03t02_implementer`.
- Work only in `/Users/thanhnguyen/Documents/MowStudio`, branch `tnguyen/phase7.2`.
- Never stage, commit, push, switch, stash, reset, clean, or revert. Preserve all existing dirty work; the user owns Git.
- Follow TDD and write `handoffs/p03t02-report.md`.

## Files

- Modify: `src/app/booking/[id]/page.tsx`
- Modify: `src/features/booking/presentation/booking-wizard.tsx`
- Create: `src/features/booking/presentation/booking-wizard.test.tsx`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`
- Modify: `tests/e2e/guest-booking.spec.ts`

## Stable behavior and props

- Extend props exactly to `{ serviceId, serviceName, durationMinutes, priceAmount }`.
- Keep step order/state, `/api/availability` URL, date/slot handlers, `createBookingAction` payload, failure recovery, and payment redirect unchanged.
- Use completed `BookingProgress`, `FormField`, and `actionClassName`.
- Route continues its existing service query and passes real duration/price; do not refetch service on the client.
- Cozy, dark, minimal 8/4 transaction composition; no business/domain changes.

## TDD and implementation

1. Mock `createBookingAction`, render the wizard, and add a failing test asserting the progress list, heading `Thông tin liên hệ`, `60 phút`, formatted `500.000 ₫`, and `Tiếp tục` with `ui-action--primary`. If router must be mocked for render, keep the mock minimal.
2. Run `pnpm vitest run src/features/booking/presentation/booking-wizard.test.tsx`; record expected RED because summary data/shared presentation are absent.
3. Pass `service.durationMinutes` and `service.priceAmount` from route to `BookingWizard`, retaining the current query and `notFound` behavior.
4. Replace equal step pills with `<BookingProgress currentStep={step} steps={steps} />`; keep the same steps/state indexes.
5. Build `.booking-composition`: active step in `.booking-window.ui-surface` and `aside.booking-context` showing service name, duration, full price, exact `Cọc 30% ở bước thanh toán`. Use `Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })`.
6. Wrap all existing inputs/textarea with `FormField`, preserving labels, registrations, validation/error messages and field types. Preserve every button label and state transition. Use primary action classes forward, tertiary back. Set `aria-busy={loading}` on the active `.booking-window`.
7. Style 8/4 desktop layout and mobile stacking, a single booking-window entrance (opacity + max 12px vertical movement), removed under reduced motion. Selected slots use Champagne/Bone contrast; unselected use Espresso/Warm-line. Ensure 375px no page overflow and actions remain ≥44px.
8. Preserve/extend `tests/e2e/guest-booking.spec.ts` only as needed for the same labels and redirect; do not weaken assertions.
9. Verify:

```text
pnpm vitest run src/features/booking/presentation/booking-wizard.test.tsx
pnpm typecheck
pnpm eslint 'src/app/booking/[id]/page.tsx' src/features/booking/presentation/booking-wizard.tsx src/features/booking/presentation/booking-wizard.test.tsx tests/e2e/guest-booking.spec.ts
pnpm test
```

Playwright is required at the Phase 03 gate; the implementer may skip it after statically preserving the spec.

## Report

Document RED/GREEN, state/fetch/payload/redirect preservation, fields/actions, changed files, verification and concerns. Do not commit. Intended user-managed commit: `feat: redesign the booking wizard`.
