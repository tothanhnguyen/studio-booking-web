# Phase 04 — Authentication and Customer Account

## Task 1: Build the split authentication composition

**Files:**
- Create: `src/features/auth/presentation/auth-shell.tsx`
- Create: `src/features/auth/presentation/auth-shell.test.tsx`
- Modify: `src/features/auth/presentation/auth-form.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`
- Modify: `tests/e2e/auth.spec.ts`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `AuthShell({ mode, children })` accepts `mode: "login" | "register"` and `children: ReactNode`.
- `AuthForm({ mode })` signature and authentication behavior remain unchanged.

- [ ] **Step 1: Write the failing auth-shell test**

```tsx
render(<AuthShell mode="login"><form aria-label="Đăng nhập form" /></AuthShell>);
expect(screen.getByTestId("auth-shell")).toHaveAttribute("data-auth-mode", "login");
expect(screen.getByRole("img", { name: /Không gian MowStudio/i })).toBeInTheDocument();
expect(screen.getByText("Không gian cho ý tưởng thành hình.")).toBeInTheDocument();
```

- [ ] **Step 2: Run the test to verify missing module**

Run: `pnpm vitest run src/features/auth/presentation/auth-shell.test.tsx`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement `AuthShell`**

Render a two-column `.auth-shell` with `data-testid="auth-shell"`, a `.auth-shell__form` children region, and a `.auth-shell__visual` using `Image` with `/media/hero-capsules-poster.webp`, alt `Không gian MowStudio`, and the statement `Không gian cho ý tưởng thành hình.`. Hide only the visual region below 768px.

- [ ] **Step 4: Migrate `AuthForm` to shared form primitives**

Keep the current submit logic, router destination, messages, and autocomplete values. Wrap email/password in `FormField`, use `actionClassName("primary")`, set `aria-busy={loading}`, and keep the existing status/alert roles.

- [ ] **Step 5: Recompose login and register pages**

Use `AuthShell`, `PageHeading`, and the existing copy. On login, keep Google as a secondary full-width action and add a visible `hoặc` separator. Keep the cross-link between login and register.

- [ ] **Step 6: Verify auth behavior**

Run: `pnpm vitest run src/features/auth/presentation && pnpm typecheck`

Then run seeded `tests/e2e/auth.spec.ts`; expected PASS for registration, login, Google action presence, and navigation.

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/presentation src/app/login/page.tsx src/app/register/page.tsx src/styles/forms.css src/styles/utilities.css tests/e2e/auth.spec.ts
git commit -m "feat: redesign authentication pages"
```

## Task 2: Add the customer booking timeline

**Files:**
- Create: `src/features/dashboard/presentation/customer-booking-timeline.tsx`
- Create: `src/features/dashboard/presentation/customer-booking-timeline.test.tsx`
- Modify: `src/app/account/bookings/page.tsx`
- Modify: `src/features/auth/presentation/claim-bookings-banner.tsx`
- Modify: `src/features/dashboard/presentation/booking-filters.tsx`
- Modify: `tests/e2e/dashboards.spec.ts`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `CustomerBookingTimeline({ result, detailBasePath })` consumes the existing `BookingPage` type.
- Admin continues using `BookingList`; customer pages stop importing it.
- `BookingFilters` public props remain unchanged.

- [ ] **Step 1: Write the failing timeline test**

```tsx
render(<CustomerBookingTimeline result={bookingPageFixture} detailBasePath="/account/bookings" />);
expect(screen.getByRole("list")).toHaveClass("booking-timeline");
expect(screen.getByRole("link", { name: bookingPageFixture.items[0]!.serviceName })).toHaveAttribute(
  "href",
  `/account/bookings/${bookingPageFixture.items[0]!.id}`,
);
expect(screen.getByText(/Photo Studio/)).toBeInTheDocument();
```

For an empty fixture, assert the `EmptyState` heading `Chưa có booking phù hợp` and a `/studios` discovery link.

- [ ] **Step 2: Run the test and confirm failure**

Run: `pnpm vitest run src/features/dashboard/presentation/customer-booking-timeline.test.tsx`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the semantic timeline**

Render `ul.booking-timeline`. Each item contains a decorative rail marker with `aria-hidden="true"`, mono date/time, service link, room name, and existing `BookingStatusBadge`. Do not expose decorative numbering.

- [ ] **Step 4: Recompose account booking list**

Use `PageHeading` with eyebrow `Tài khoản`, existing title/description, the claim strip, filters, `CustomerBookingTimeline`, and existing pagination. Keep authentication redirect and query parsing unchanged.

- [ ] **Step 5: Restyle claim and filters**

Turn `ClaimBookingsBanner` into a low-emphasis `.context-strip` with one compact primary action. Use a segmented-looking select/button group for desktop while keeping the native `<select>` and form action intact on mobile.

- [ ] **Step 6: Verify customer dashboard**

Run: `pnpm vitest run src/features/dashboard/presentation/customer-booking-timeline.test.tsx src/features/dashboard/application/customer-booking-queries.test.ts && pnpm typecheck`

Then run seeded `tests/e2e/dashboards.spec.ts` and `tests/e2e/guest-claim.spec.ts`; expected PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/dashboard/presentation/customer-booking-timeline.tsx src/features/dashboard/presentation/customer-booking-timeline.test.tsx src/features/dashboard/presentation/booking-filters.tsx src/features/auth/presentation/claim-bookings-banner.tsx src/app/account/bookings/page.tsx src/styles/utilities.css tests/e2e/dashboards.spec.ts
git commit -m "feat: add customer booking timeline"
```

## Task 3: Redesign customer booking detail

**Files:**
- Modify: `src/app/account/bookings/[id]/page.tsx`
- Modify: `src/features/dashboard/presentation/booking-detail.tsx`
- Create: `src/features/dashboard/presentation/booking-detail.test.tsx`
- Modify: `tests/e2e/dashboards.spec.ts`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `BookingDetail({ booking, showCustomer? })` signature remains unchanged for admin reuse.
- Customer cancellation action, reason field name, and authorization remain unchanged.

- [ ] **Step 1: Write a failing detail test**

```tsx
render(<BookingDetail booking={bookingFixture} />);
expect(screen.getByRole("region", { name: "Lịch studio" })).toBeInTheDocument();
expect(screen.getByRole("region", { name: "Thanh toán" })).toBeInTheDocument();
expect(screen.getByText(bookingFixture.id, { exact: false })).toBeInTheDocument();
```

When `showCustomer` is true, assert the `Thông tin khách hàng` region exists.

- [ ] **Step 2: Run the test and confirm the old component fails the region/code contract**

Run: `pnpm vitest run src/features/dashboard/presentation/booking-detail.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Add semantic detail regions**

Give each existing section an accessible heading relationship, use `.booking-detail-grid`, apply mono type to times and money, and include a compact booking code line. Keep all current values and conditional customer section.

- [ ] **Step 4: Recompose customer detail header and danger zone**

Use `PageHeading` for booking code/title, keep `BookingDetail`, and place cancellation in `section.danger-zone` at the end. Migrate the reason field to `FormField` and the submit button to `actionClassName("danger")` without changing its server action.

- [ ] **Step 5: Verify and commit**

Run: `pnpm vitest run src/features/dashboard/presentation/booking-detail.test.tsx && pnpm typecheck`

Expected: PASS. Run seeded dashboard E2E and expect cancellation UI assertions to remain valid.

```bash
git add src/app/account/bookings/[id]/page.tsx src/features/dashboard/presentation/booking-detail.tsx src/features/dashboard/presentation/booking-detail.test.tsx src/styles/forms.css src/styles/utilities.css tests/e2e/dashboards.spec.ts
git commit -m "feat: redesign customer booking detail"
```

## Phase 04 Gate

- [ ] Run `pnpm vitest run src/features/auth src/features/dashboard` and expect PASS.
- [ ] Run seeded auth, dashboard, and guest-claim Playwright specs and expect PASS.
- [ ] Inspect login, register, empty account, populated account, and cancelled booking at 1440px and 375px.

