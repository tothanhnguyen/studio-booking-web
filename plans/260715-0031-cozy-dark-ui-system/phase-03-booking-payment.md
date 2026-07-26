# Phase 03 — Booking and Payment

## Task 1: Add transaction shell and progress rail

**Files:**
- Create: `src/app/booking/layout.tsx`
- Create: `src/features/booking/presentation/booking-progress.tsx`
- Create: `src/features/booking/presentation/booking-progress.test.tsx`
- Modify: `src/styles/shell.css`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- Produces `BookingProgressProps` from `plan.md`.
- Transaction layout renders `data-page-shell="transaction"` and does not fetch data.

- [x] **Step 1: Write the failing progress test**

```tsx
const steps = ["Liên hệ", "Ngày", "Khung giờ", "Xác nhận", "Giữ chỗ"] as const;
render(<BookingProgress currentStep={2} steps={steps} />);
expect(screen.getByRole("list", { name: "Các bước đặt lịch" })).toBeInTheDocument();
expect(screen.getByText("Khung giờ").closest("li")).toHaveAttribute("aria-current", "step");
expect(screen.getByText("Liên hệ").closest("li")).toHaveAttribute("data-step-state", "complete");
expect(screen.getByText("Xác nhận").closest("li")).toHaveAttribute("data-step-state", "upcoming");
```

- [x] **Step 2: Run the test to confirm the module is missing**

Run: `pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx`

Expected: FAIL with module-not-found.

- [x] **Step 3: Implement semantic progress**

Map steps to `li.booking-progress__step` and calculate `complete`, `active`, or `upcoming` from the index. Render the numeric position in a mono span and the label in a second span. Apply `aria-current="step"` only to the active item.

- [x] **Step 4: Add the transaction layout**

```tsx
export default function BookingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="transaction-shell" data-page-shell="transaction">{children}</div>;
}
```

Use `.app-shell:has([data-page-shell="transaction"])` in `shell.css` to hide room navigation and footer, reduce main width to `--content-transaction`, and keep the wordmark/account context available.

- [x] **Step 5: Style progress and verify**

Use one Warm line rail with active Champagne and completed Brass segments. On mobile, allow horizontal scrolling inside the progress region only; the page itself must not overflow.

Run: `pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx && pnpm typecheck`

Expected: PASS.

- [x] **Step 6: Hand off for the user-managed commit**

```bash
git add src/app/booking/layout.tsx src/features/booking/presentation/booking-progress.tsx src/features/booking/presentation/booking-progress.test.tsx src/styles/shell.css src/styles/utilities.css
git commit -m "feat: add focused booking transaction shell"
```

## Task 2: Recompose the booking wizard

**Files:**
- Modify: `src/app/booking/[id]/page.tsx`
- Modify: `src/features/booking/presentation/booking-wizard.tsx`
- Create: `src/features/booking/presentation/booking-wizard.test.tsx`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`
- Modify: `tests/e2e/guest-booking.spec.ts`

**Interfaces:**
- Extend `BookingWizard` props to `{ serviceId, serviceName, durationMinutes, priceAmount }`.
- Booking state order, fetch URL, server-action payload, and redirect remain unchanged.
- Uses `BookingProgress`, `FormField`, and `actionClassName`.

- [x] **Step 1: Add a failing wizard presentation test**

Mock `createBookingAction`, render the wizard, and assert:

```tsx
expect(screen.getByRole("list", { name: "Các bước đặt lịch" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "Thông tin liên hệ" })).toBeInTheDocument();
expect(screen.getByText("60 phút")).toBeInTheDocument();
expect(screen.getByText("500.000 ₫")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Tiếp tục" })).toHaveClass("ui-action--primary");
```

- [x] **Step 2: Run the test and verify failure**

Run: `pnpm vitest run src/features/booking/presentation/booking-wizard.test.tsx`

Expected: FAIL because duration/price and shared presentation do not exist.

- [x] **Step 3: Pass real service summary data from the route**

Keep the current service query and pass `service.durationMinutes` and `service.priceAmount` into `BookingWizard`. Do not fetch service data again on the client.

- [x] **Step 4: Replace equal pills with `BookingProgress`**

Keep `steps` and `step` state unchanged. Replace the current `<ol>` with `<BookingProgress currentStep={step} steps={steps} />`.

- [x] **Step 5: Build the 8/4 transaction composition**

Wrap the active step in `.booking-window.ui-surface`. Add an `aside.booking-context` showing service name, duration, full price, and `Cọc 30% ở bước thanh toán`. Use `Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })` for price.

- [x] **Step 6: Migrate fields and actions without changing handlers**

Wrap each existing input in `FormField`, preserve `register`, Zod messages, button labels, state transitions, slot fetch, submit payload, and redirect. Apply `actionClassName("primary")` to forward actions and `actionClassName("tertiary")` to back actions. Add `aria-busy={loading}` to the active window.

- [x] **Step 7: Add directional step styles**

Use a single `booking-window` entrance of opacity plus 12px vertical movement. Disable it under reduced motion. Selected slots use Champagne/Bone contrast; unselected slots use Espresso with Warm line borders.

- [x] **Step 8: Preserve E2E behavior**

Run: `pnpm vitest run src/features/booking/presentation/booking-wizard.test.tsx && pnpm typecheck`

Then run the seeded `tests/e2e/guest-booking.spec.ts`; keep its labels and booking redirect contract passing.

- [x] **Step 9: Hand off for the user-managed commit**

```bash
git add src/app/booking/[id]/page.tsx src/features/booking/presentation/booking-wizard.tsx src/features/booking/presentation/booking-wizard.test.tsx src/styles/forms.css src/styles/utilities.css tests/e2e/guest-booking.spec.ts
git commit -m "feat: redesign the booking wizard"
```

## Task 3: Redesign payment and confirmation

**Files:**
- Create: `src/features/payment/presentation/copy-payment-value.tsx`
- Create: `src/features/payment/presentation/copy-payment-value.test.tsx`
- Modify: `src/features/payment/presentation/vietqr-payment.tsx`
- Modify: `src/features/payment/presentation/payment-status.tsx`
- Modify: `src/features/booking/presentation/booking-summary.tsx`
- Modify: `src/app/booking/[id]/payment/page.tsx`
- Modify: `src/app/booking/[id]/confirmation/page.tsx`
- Modify: `tests/e2e/room-only-payment.spec.ts`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- Produces `CopyPaymentValueProps` from `plan.md`.
- `VietQrPayment` and `PaymentStatus` public props remain unchanged.

- [ ] **Step 1: Write the failing clipboard test**

```tsx
const writeText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, { clipboard: { writeText } });
render(<CopyPaymentValue label="Số tài khoản" value="0123456789" />);
await user.click(screen.getByRole("button", { name: "Sao chép Số tài khoản" }));
expect(writeText).toHaveBeenCalledWith("0123456789");
expect(screen.getByRole("status")).toHaveTextContent("Đã sao chép");
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `pnpm vitest run src/features/payment/presentation/copy-payment-value.test.tsx`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement clipboard feedback**

Create a client component that calls `navigator.clipboard.writeText(value)`, shows `Đã sao chép` in a polite status region after success, shows `Không thể sao chép` on failure, and resets to `Sao chép` after 2000ms. Clear the timer on unmount.

- [ ] **Step 4: Recompose the VietQR panel**

Keep the QR `<img>` accessible and on a Bone square. Use `CopyPaymentValue` for account number and transfer content. Keep amount, bank BIN, and account name visible. Use mono type for all transfer values.

- [ ] **Step 5: Separate summary, status, and QR hierarchy**

On payment page: heading and countdown first, then a two-column grid containing QR/instructions and the booking summary/status rail. On confirmation: make the derived status description the main heading, show booking code in mono, then summary and next action. Do not change access-token lookup or payment view queries.

- [ ] **Step 6: Verify payment behavior**

Run: `pnpm vitest run src/features/payment/presentation src/features/payment/application/get-payment-view.test.ts && pnpm typecheck`

Then run seeded `tests/e2e/room-only-payment.spec.ts`; expected PASS with QR, transfer content, payment state, and confirmation navigation intact.

- [ ] **Step 7: Commit**

```bash
git add src/features/payment/presentation src/features/booking/presentation/booking-summary.tsx src/app/booking/[id]/payment/page.tsx src/app/booking/[id]/confirmation/page.tsx src/styles/utilities.css tests/e2e/room-only-payment.spec.ts
git commit -m "feat: redesign payment and confirmation pages"
```

## Phase 03 Gate

- [ ] Run `pnpm vitest run src/features/booking src/features/payment` and expect PASS.
- [ ] Run seeded guest-booking and room-only-payment Playwright specs and expect PASS.
- [ ] Inspect booking, payment, confirmation, expired-slot, and no-availability states at 1440px and 375px.
