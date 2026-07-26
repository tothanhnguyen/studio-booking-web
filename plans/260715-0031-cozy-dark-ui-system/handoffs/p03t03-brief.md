# Phase 03 Task 3 — Payment and Confirmation

## Ownership and safety

- Implementer: `/root/p03t03_implementer`.
- Work only in `/Users/thanhnguyen/Documents/MowStudio`, branch `tnguyen/phase7.2`.
- Never stage, commit, push, switch, stash, reset, clean, or revert; preserve all dirty work. The user owns Git.
- Follow TDD and write `handoffs/p03t03-report.md`.

## Files

- Create: `src/features/payment/presentation/copy-payment-value.tsx`
- Create: `src/features/payment/presentation/copy-payment-value.test.tsx`
- Modify: `src/features/payment/presentation/vietqr-payment.tsx`
- Modify: `src/features/payment/presentation/payment-status.tsx`
- Modify: `src/features/booking/presentation/booking-summary.tsx`
- Modify: `src/app/booking/[id]/payment/page.tsx`
- Modify: `src/app/booking/[id]/confirmation/page.tsx`
- Modify: `tests/e2e/room-only-payment.spec.ts`
- Modify: `src/styles/utilities.css`

## Contracts

- Implement exact `CopyPaymentValueProps = Readonly<{ label: string; value: string }>`.
- Keep `VietQrPayment` and `PaymentStatus` public prop shapes unchanged.
- Do not change guest-cookie/token lookup, `getPaymentView` queries, webhook flow, booking/payment state logic, routes, or QR accessibility.
- Maintain cozy, dark, minimal transaction hierarchy and shared tokens/actions.

## TDD and implementation

1. Add a failing clipboard test with mocked `navigator.clipboard.writeText`: click `Sao chép Số tài khoản`, assert exact copied value and polite status `Đã sao chép`. Cover rejected writes and 2000ms reset/cleanup with fake timers if practical.
2. Run `pnpm vitest run src/features/payment/presentation/copy-payment-value.test.tsx`; record expected module-not-found RED.
3. Build a client `CopyPaymentValue`: visible label/value, button accessible name `Sao chép ${label}`, success `Đã sao chép`, failure `Không thể sao chép`, polite status region, reset to `Sao chép` after 2000ms, and clear pending timer on unmount. Handle rapid clicks without leaking timers.
4. Recompose VietQR: retain accessible QR `<img>` on a Bone square; use `CopyPaymentValue` for account number and transfer content; keep amount, bank BIN, account name visible; mono type for transfer values. Preserve current props exactly.
5. Payment page hierarchy: heading/countdown first, then a two-column grid with QR/instructions and summary/status rail; keep confirmation route action. Confirmation page: derived status description is the main `h1`, booking code in mono, then summary and next action/current remaining-amount guidance. Do not introduce claims beyond returned view data.
6. Restyle `BookingSummary` and `PaymentStatus` using shared semantic classes/tokens; props/data remain unchanged. If sharing the derived status description with confirmation, keep one source of truth without changing `PaymentStatus` props.
7. Extend `room-only-payment.spec.ts` to assert QR, transfer content/copy affordance, payment state, confirmation navigation and final confirmed/paid status while retaining webhook behavior. Do not weaken existing assertions.
8. Verify:

```text
pnpm vitest run src/features/payment/presentation src/features/payment/application/get-payment-view.test.ts
pnpm typecheck
pnpm eslint src/features/payment/presentation src/features/booking/presentation/booking-summary.tsx 'src/app/booking/[id]/payment/page.tsx' 'src/app/booking/[id]/confirmation/page.tsx' tests/e2e/room-only-payment.spec.ts
pnpm test
```

Playwright remains required at Phase 03 gate.

## Report

Document RED/GREEN, clipboard timer/error behavior, unchanged data/auth routes, hierarchy changes, verification and concerns. Do not commit. Intended user-managed commit: `feat: redesign payment and confirmation pages`.
