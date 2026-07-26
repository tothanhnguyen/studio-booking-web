# Phase 4 — Booking, Payment, Confirmation: Studio Ticket

**Context:** `plan.md`, spec §5.4. Absorbs the unfinished restyle scope of old plan `260715-0031` phase-03 (items 16–25) — read that file for background, but this phase file is authoritative.
**Priority:** High — conversion path.
**Status:** Not started

**Hard rules:** No changes to booking state logic, step order, server actions, hold/expiry behavior, or payment integration. `BookingProgressProps { currentStep, steps }` and `CopyPaymentValueProps { label, value }` signatures unchanged. Accessible names asserted in `tests/e2e/guest-booking.spec.ts`, `room-only-payment.spec.ts`, `assisted-lifecycle.spec.ts` change only with same-task test updates. Motion here is moderate: directional step transitions 12–16px, no parallax/marquee.

## Task 1: Progress rail (TDD)

**Files:**
- Modify: `src/features/booking/presentation/booking-progress.tsx`
- Test: `src/features/booking/presentation/booking-progress.test.tsx`

- [ ] **Step 1 (test first):** Add to `booking-progress.test.tsx`:

```tsx
it("marks completed, active, and future steps on the rail", () => {
  render(<BookingProgress currentStep={2} steps={["Chọn giờ", "Thông tin", "Xác nhận"]} />);
  const items = screen.getAllByRole("listitem");
  expect(items[0]).toHaveAttribute("data-step-state", "completed");
  expect(items[1]).toHaveAttribute("data-step-state", "active");
  expect(items[2]).toHaveAttribute("data-step-state", "future");
});
```

Run: FAIL (attribute missing). Keep every existing assertion green.

- [ ] **Step 2:** Restyle as one continuous rail: `<ol className="booking-rail">`, each `<li data-step-state=...>` joined by a connecting line (`::before` on li, background = Action for completed, `--color-border` for future). Active step: Action-filled pill, `aria-current="step"` (preserve if already present). Mono step numbers.
- [ ] **Step 3:** CSS in `editorial.css` under `.booking-rail-` prefix; 375px: labels below markers, no overflow.
- [ ] **Step 4:** Run `pnpm vitest run src/features/booking/presentation/booking-progress.test.tsx` — PASS. Commit: `feat: restyle booking progress as continuous rail`

## Task 2: Wizard ticket panel + directional transitions

**Files:**
- Modify: `src/features/booking/presentation/booking-wizard.tsx`, `booking-summary.tsx`
- Test: `src/features/booking/presentation/booking-wizard.test.tsx`

- [ ] **Step 1:** Wrap the active step content in `.booking-ticket` panel: Raised surface, 1px border, radius `var(--radius-md)`, mono meta header (service · room · date). Summary (`booking-summary.tsx`) becomes the ticket stub: dashed separator (`border-inline-start: 1px dashed var(--color-border)` desktop; dashed top border mobile), totals in mono.
- [ ] **Step 2:** Directional transition: on step change, apply `data-direction="forward" | "back"` to the ticket; CSS animates `opacity` + `translateX(±14px)` over `var(--motion-base)`. Implement with a `key={currentStep}` remount + CSS animation (no new dependency). Under reduced motion: no animation.
- [ ] **Step 3 (tests):** Run existing `booking-wizard.test.tsx` — all green without behavioral edits. Add one assertion that the active panel has `data-direction` after navigation if the test harness already simulates step navigation; otherwise skip (do not force new harness).
- [ ] **Step 4:** Fields ≥48px height, visible Action-colored focus ring (verify `forms.css`; extend there if missing). Time slots: mono, selected state = Action fill + label, not color alone.
- [ ] **Step 5:** Stale-slot and no-availability states: keep existing behavior/copy; restyle with `EmptyState` + specific retry action.
- [ ] **Step 6:** `pnpm vitest run src/features/booking` — PASS. Commit: `feat: frame booking wizard as studio ticket with directional steps`

## Task 3: Payment page

**Files:**
- Modify: `src/features/payment/presentation/vietqr-payment.tsx`, `payment-status.tsx`
- Modify: `src/app/booking/[id]/payment/page.tsx`

- [ ] **Step 1:** Order (top→bottom): hold countdown (primary context, mono, existing `hold-countdown.tsx` logic untouched) → QR on `--color-surface-raised` card (`#FFFDF8`, near-white for scan reliability) → account number / transfer content rows with `CopyPaymentValue` (mono) → deposit / total / remaining hierarchy (remaining largest, mono).
- [ ] **Step 2:** `payment-status.tsx` renders in its own status rail below the QR card, not inside it; status badge keeps text label + muted semantic color.
- [ ] **Step 3:** Run `pnpm vitest run src/features/payment` — PASS (update `copy-payment-value.test.tsx` only if markup class assertions break; behavior unchanged).
- [ ] **Step 4:** `pnpm test:e2e -- room-only-payment` against seeded DB — PASS. Commit: `feat: restyle payment page as transfer receipt`

## Task 4: Confirmation page

**Files:**
- Modify: `src/app/booking/[id]/confirmation/page.tsx`

- [ ] **Step 1:** Booking state as `h1.display-md` (keep exact existing state wording used by e2e). Booking code directly under it in mono at large size with `CopyPaymentValue` if already used, else plain mono.
- [ ] **Step 2:** Receipt-style summary block (ticket styling from Task 2 CSS), then the single next valid action for the current state. No confetti/celebration animation.
- [ ] **Step 3:** `pnpm test:e2e -- guest-booking` — PASS. Commit: `feat: restyle confirmation as booking receipt`

## Task 5: Phase gate

- [ ] `pnpm ci:verify` + `pnpm build` — PASS.
- [ ] `pnpm test:e2e:critical` — PASS.
- [ ] Manual: full guest booking flow desktop + 375px; keyboard-only pass through wizard; reduced motion shows instant step swaps; countdown/QR/copy actions work.
- [ ] Mark old plan `260715-0031` phase-03 as superseded (add one-line note at top pointing here). Do not edit its checkboxes.

## Success Criteria

Booking path reads as one continuous "studio ticket" transaction with a single progress rail, directional step motion, scannable QR, and receipt-style confirmation — zero behavioral change.
