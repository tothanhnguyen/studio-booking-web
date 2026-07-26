# Phase 05 — Admin Operations

## Task 1: Build active warm-dark admin navigation

**Files:**
- Create: `src/features/dashboard/presentation/admin-nav.tsx`
- Create: `src/features/dashboard/presentation/admin-nav.test.tsx`
- Modify: `src/features/dashboard/presentation/admin-shell.tsx`
- Modify: `src/styles/shell.css`

**Interfaces:**
- `AdminNav()` reads `usePathname()` and renders the fixed current admin routes.
- `AdminShell({ children })` signature remains unchanged.

- [ ] **Step 1: Write the failing active-route test**

Mock `next/navigation` to return `/admin/bookings/calendar`, render `AdminNav`, and assert:

```tsx
expect(screen.getByRole("link", { name: "Lịch booking" })).toHaveAttribute("aria-current", "page");
expect(screen.getByRole("navigation", { name: "Điều hướng quản trị" })).toBeInTheDocument();
expect(screen.getByText("Vận hành")).toBeInTheDocument();
expect(screen.getByText("Tài chính")).toBeInTheDocument();
expect(screen.getByText("Cấu hình")).toBeInTheDocument();
```

- [ ] **Step 2: Run the test to confirm missing module**

Run: `pnpm vitest run src/features/dashboard/presentation/admin-nav.test.tsx`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement grouped navigation**

Create a client component with route groups:

```ts
const groups = [
  { label: "Vận hành", links: [["/admin", "Tổng quan"], ["/admin/bookings", "Booking"], ["/admin/bookings/calendar", "Lịch booking"]] },
  { label: "Tài chính", links: [["/admin/payments", "Payments"]] },
  { label: "Cấu hình", links: [["/admin/rooms", "Phòng studio"], ["/admin/services", "Dịch vụ"], ["/admin/schedule", "Lịch studio"], ["/admin/blocked-slots", "Slot bị chặn"]] },
] as const;
```

Use exact-match for `/admin` and prefix-match for detail routes, with calendar checked before `/admin/bookings`.

- [ ] **Step 4: Recompose `AdminShell`**

Render a sticky `aside.admin-sidebar` containing label `Quản trị MowStudio` and `AdminNav`, plus `div.admin-content`. Below 768px, the sidebar becomes a non-sticky top region with horizontally scrollable grouped links inside its own container.

- [ ] **Step 5: Verify and commit**

Run: `pnpm vitest run src/features/dashboard/presentation/admin-nav.test.tsx && pnpm typecheck`

Expected: PASS.

```bash
git add src/features/dashboard/presentation/admin-nav.tsx src/features/dashboard/presentation/admin-nav.test.tsx src/features/dashboard/presentation/admin-shell.tsx src/styles/shell.css
git commit -m "feat: redesign admin navigation shell"
```

## Task 2: Standardize admin dashboard and operational lists

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/bookings/page.tsx`
- Modify: `src/app/admin/bookings/calendar/page.tsx`
- Modify: `src/app/admin/payments/page.tsx`
- Modify: `src/features/dashboard/presentation/booking-list.tsx`
- Create: `src/features/dashboard/presentation/booking-list.test.tsx`
- Modify: `src/features/dashboard/presentation/booking-calendar.tsx`
- Modify: `src/features/dashboard/presentation/booking-calendar.test.tsx`
- Modify: `src/features/dashboard/presentation/booking-status-badge.tsx`
- Modify: `tests/e2e/dashboards.spec.ts`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `BookingList({ result, detailBasePath })` signature remains unchanged and is admin-only after Phase 04.
- Booking query functions and pagination remain unchanged.

- [ ] **Step 1: Write a failing operational-row test**

```tsx
render(<BookingList result={bookingPageFixture} detailBasePath="/admin/bookings" />);
expect(screen.getByRole("list")).toHaveClass("operational-list");
expect(screen.getByRole("listitem")).toHaveClass("operational-row");
expect(screen.getByText(bookingPageFixture.items[0]!.customerEmail)).toBeInTheDocument();
```

- [ ] **Step 2: Run list/calendar tests and capture baseline**

Run: `pnpm vitest run src/features/dashboard/presentation/booking-list.test.tsx src/features/dashboard/presentation/booking-calendar.test.tsx`

Expected: booking-list test FAIL; existing calendar tests PASS.

- [ ] **Step 3: Implement compact operational rows**

Use a CSS grid row with service/room, customer, start time, and status columns above 900px. Below 900px, use a vertical block. Retain semantic list markup and detail links.

- [ ] **Step 4: Apply muted status palette**

Map existing statuses to token-backed classes: pending uses Brass, confirmed uses Sage, cancelled uses Clay, and expired/completed use Smoke. Keep current Vietnamese labels and border/text contrast.

- [ ] **Step 5: Recompose dashboard and list pages**

Use `PageHeading` on dashboard, bookings, calendar, and payments. Dashboard renders real total, current quick links, and `BookingList` for the five recent results already queried. Bookings retains filters/pagination. Calendar retains date inputs and agenda grouping. Payments becomes an operational list with payment/refund status and deposit amount.

- [ ] **Step 6: Verify operational pages**

Run: `pnpm vitest run src/features/dashboard/presentation && pnpm typecheck`

Then run seeded `tests/e2e/dashboards.spec.ts`; expected PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/bookings src/app/admin/payments/page.tsx src/features/dashboard/presentation src/styles/utilities.css tests/e2e/dashboards.spec.ts
git commit -m "feat: redesign admin operational views"
```

## Task 3: Make catalog editors compact and intentional

**Files:**
- Modify: `src/app/admin/rooms/page.tsx`
- Modify: `src/app/admin/services/page.tsx`
- Modify: `src/features/studio-room/presentation/room-form.tsx`
- Modify: `src/features/service/presentation/service-form.tsx`
- Create: `src/features/studio-room/presentation/room-form.test.tsx`
- Create: `src/features/service/presentation/service-form.test.tsx`
- Modify: `tests/e2e/admin-catalog.spec.ts`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `RoomForm` and `ServiceForm` props, field names, validation schemas, and server actions remain unchanged.
- Existing records are wrapped in native `<details>`; no new client state is introduced.

- [ ] **Step 1: Add failing form presentation tests**

For each form, assert the root has `admin-editor`, the current labels remain associated with controls, result regions preserve roles, and submit buttons use primary action styling.

```tsx
expect(container.querySelector("form.admin-editor")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Lưu phòng" })).toHaveClass("ui-action--primary");
```

- [ ] **Step 2: Run tests and confirm presentation failure**

Run: `pnpm vitest run src/features/studio-room/presentation/room-form.test.tsx src/features/service/presentation/service-form.test.tsx`

Expected: FAIL on the new classes.

- [ ] **Step 3: Migrate forms to shared styling**

Keep react-hook-form and action calls unchanged. Use `FormField`, `.admin-editor`, `.admin-editor__grid`, and `actionClassName("primary")`. Keep checkboxes native and visibly labelled. Use two columns only above 768px.

- [ ] **Step 4: Collapse existing editors by default**

On room/service pages, render the new-item form in one open `.ui-surface`. Wrap each existing record in:

```tsx
<details className="catalog-record">
  <summary><strong>{item.name}</strong><span>{item.isActive ? "Đang hoạt động" : "Đang ẩn"}</span></summary>
  <div className="catalog-record__editor">{editor}</div>
</details>
```

Keep hide/reactivate forms after the editor and style them as compact secondary actions.

- [ ] **Step 5: Verify catalog flows**

Run: `pnpm vitest run src/features/studio-room/presentation src/features/service/presentation && pnpm typecheck`

Then run seeded `tests/e2e/admin-catalog.spec.ts`; expected PASS for create, edit, hide, and reactivate.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/rooms/page.tsx src/app/admin/services/page.tsx src/features/studio-room/presentation src/features/service/presentation src/styles/forms.css src/styles/utilities.css tests/e2e/admin-catalog.spec.ts
git commit -m "feat: redesign admin catalog editors"
```

## Task 4: Redesign schedule, blocked slots, and lifecycle detail

**Files:**
- Modify: `src/app/admin/schedule/page.tsx`
- Modify: `src/app/admin/blocked-slots/page.tsx`
- Modify: `src/app/admin/bookings/[id]/page.tsx`
- Modify: `src/features/availability/presentation/schedule-editor.tsx`
- Create: `src/features/availability/presentation/schedule-editor.test.tsx`
- Modify: `tests/e2e/admin-schedule.spec.ts`
- Modify: `tests/e2e/assisted-lifecycle.spec.ts`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `ScheduleEditor({ rooms })` props and server-action payloads remain unchanged.
- Admin lifecycle server actions, form field names, and conditions remain unchanged.

- [ ] **Step 1: Add a failing schedule presentation test**

```tsx
render(<ScheduleEditor rooms={[{ id: "room-1", name: "Photo Studio" }]} />);
expect(screen.getByRole("form", { name: "Giờ làm việc" })).toHaveClass("admin-editor");
expect(screen.getByRole("form", { name: "Chặn khung giờ" })).toHaveClass("admin-editor");
```

Add `aria-label` to the forms in the implementation so these roles are stable.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm vitest run src/features/availability/presentation/schedule-editor.test.tsx`

Expected: FAIL because current forms are unnamed and unstyled.

- [ ] **Step 3: Migrate schedule forms**

Use `FormField`, `.admin-editor`, and shared actions while preserving parsing, timezone conversion, server calls, and status messages. Keep the two-panel desktop grid and single-column mobile layout.

- [ ] **Step 4: Build the blocked-slot agenda**

Use `PageHeading`, render slots as `ul.blocked-slot-agenda`, apply mono time, and retain the delete server action. Empty state uses `EmptyState` and links back to `/admin/schedule`.

- [ ] **Step 5: Recompose booking lifecycle detail**

Use `PageHeading` plus `BookingDetail showCustomer`. Group confirm, reject/cancel, and refund actions under `section.lifecycle-actions`, with confirm primary, refund secondary, and reject/cancel danger. Keep all existing conditions and action payloads.

- [ ] **Step 6: Verify admin actions**

Run: `pnpm vitest run src/features/availability/presentation/schedule-editor.test.tsx src/features/dashboard/presentation/booking-detail.test.tsx && pnpm typecheck`

Then run seeded admin-schedule and assisted-lifecycle Playwright specs; expected PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/schedule/page.tsx src/app/admin/blocked-slots/page.tsx src/app/admin/bookings/[id]/page.tsx src/features/availability/presentation/schedule-editor.tsx src/features/availability/presentation/schedule-editor.test.tsx src/styles/forms.css src/styles/utilities.css tests/e2e/admin-schedule.spec.ts tests/e2e/assisted-lifecycle.spec.ts
git commit -m "feat: redesign admin scheduling and lifecycle UI"
```

## Phase 05 Gate

- [ ] Run `pnpm vitest run src/features/dashboard src/features/availability src/features/studio-room src/features/service` and expect PASS.
- [ ] Run seeded admin-catalog, admin-schedule, assisted-lifecycle, and dashboards Playwright specs and expect PASS.
- [ ] Inspect every admin route at 1440px and 375px; confirm the UI remains warm dark, compact, keyboard accessible, and free of nested page overflow.

