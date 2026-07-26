# Phase 03 Task 1 — Transaction Shell and Progress Rail

## Ownership and safety

- Implementer: `/root/p03t01_implementer`.
- Work only in `/Users/thanhnguyen/Documents/MowStudio`, existing branch `tnguyen/phase7.2`.
- Do not stage, commit, push, switch branches, stash, reset, clean, or revert. The user owns Git.
- Preserve every existing dirty/untracked change from Phases 01–02.
- Follow TDD and write `handoffs/p03t01-report.md`.

## Files

- Create: `src/app/booking/layout.tsx`
- Create: `src/features/booking/presentation/booking-progress.tsx`
- Create: `src/features/booking/presentation/booking-progress.test.tsx`
- Modify: `src/styles/shell.css`
- Modify: `src/styles/utilities.css`

## Contracts

- Implement the exact `BookingProgressProps` interface from `plan.md`.
- Transaction layout renders `data-page-shell="transaction"` and performs no data fetch.
- Preserve wordmark/account context while hiding room navigation and footer only for booking transaction pages.
- Use the existing cozy, dark, minimal tokens and global reduced-motion/focus behavior.

## TDD and implementation

1. Write a failing progress test with steps `Liên hệ`, `Ngày`, `Khung giờ`, `Xác nhận`, `Giữ chỗ`. Assert accessible list name `Các bước đặt lịch`, current step `Khung giờ` has `aria-current="step"`, first is `data-step-state="complete"`, and `Xác nhận` is `upcoming`.
2. Run `pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx` and record expected module-not-found RED.
3. Render semantic `ol/li.booking-progress__step`. Calculate `complete`, `active`, `upcoming` from zero-based index; render one-based numeric position in a mono span plus label in a second span. Apply `aria-current="step"` only to active.
4. Add `src/app/booking/layout.tsx`:

```tsx
export default function BookingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="transaction-shell" data-page-shell="transaction">{children}</div>;
}
```

5. In `shell.css`, use `.app-shell:has([data-page-shell="transaction"])` to hide room navigation and footer, reduce main width to `--content-transaction`, and keep wordmark/account context. Do not change auth/domain behavior.
6. Style one Warm-line progress rail; active is Champagne and completed is Brass. On mobile, horizontal scrolling is confined to the progress region; the page itself cannot overflow. Avoid pill-per-step composition.
7. Verify:

```text
pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx
pnpm typecheck
pnpm eslint src/app/booking/layout.tsx src/features/booking/presentation/booking-progress.tsx src/features/booking/presentation/booking-progress.test.tsx
pnpm test
```

## Report

Record RED/GREEN evidence, changed files, focused/full verification, shell/accessibility/responsive choices, and concerns. Do not commit. Intended user-managed commit message: `feat: add focused booking transaction shell`.
