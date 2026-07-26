# Phase 5 — Auth and Account: Brand Split, Ticket Rail

**Context:** `plan.md`, spec §5.5–5.6. Consumes Phase 1 primitives and `public/media/brand/auth-statement.webp` from Phase 2.
**Priority:** Medium.
**Status:** Not started

**Hard rules:** No auth logic changes (server actions, redirects, validation, Google OAuth flow untouched). Accessible names asserted in `tests/e2e/auth.spec.ts`, `guest-claim.spec.ts`, `dashboards.spec.ts` change only with same-task test updates.

## Task 1: Login/Register brand split

**Files:**
- Modify: `src/app/login/page.tsx`, `src/app/register/page.tsx`
- Modify: `src/features/auth/presentation/auth-form.tsx`

- [ ] **Step 1:** Build `.auth-split` layout in `editorial.css`: desktop 5/7 grid — form column (5) + brand column (7). Brand column: `next/image` of `/media/brand/auth-statement.webp` (fill, `sizes="(min-width: 1024px) 58vw, 0px"`), overlaid short brand statement in `display-md` + `SectionMarker(1, "MowStudio")`. Mobile (<1024px): brand column hidden (`display: none`), single form column with wordmark.
- [ ] **Step 2:** `auth-form.tsx`: fields via existing `FormField`; ≥48px inputs; primary action full-width; Google auth as secondary `actionClassName("secondary")` under an explicit `hoặc` divider (keep existing button accessible name). Errors stay adjacent to fields; registration success keeps the email-verification message and styling via existing success state pattern.
- [ ] **Step 3:** Both pages share the split shell — extract `src/features/auth/presentation/auth-shell.tsx` only if login and register would otherwise duplicate >20 lines of markup (DRY threshold); otherwise inline.
- [ ] **Step 4:** Run `pnpm vitest run src/features/auth` + typecheck — PASS. `pnpm test:e2e -- auth` — PASS.
- [ ] **Step 5: Commit** — `feat: restyle auth pages with editorial brand split`

## Task 2: Account bookings rail

**Files:**
- Modify: `src/app/account/bookings/page.tsx`
- Modify: `src/features/dashboard/presentation/booking-filters.tsx`
- Modify: `src/features/dashboard/presentation/customer booking list component` (locate the component rendering the customer's booking history — `customer-booking-*` or inline in the page; read first)
- Modify: `src/features/auth/presentation/claim-bookings-banner.tsx`

- [ ] **Step 1:** Page header: `PageHeading` with eyebrow "Tài khoản", `h1.display-md`; `claim-bookings-banner` restyled as a contextual strip (full-width hairline-bordered row, mono label, single action) — not a competing hero.
- [ ] **Step 2:** Booking history as vertical ticket rail: each booking = `.account-ticket` row with mono date/time + booking code, service + room names, `booking-status-badge` (text label + muted color), room material accent as a 3px inline-start bar (`data-room-material` attr reusing tokens). Wrap rows in `ScrollReveal` (stagger ≤240ms).
- [ ] **Step 3:** Filters: desktop segmented control styling on the existing filter mechanism; mobile keeps native `<select>`. No filter-behavior change.
- [ ] **Step 4:** Empty state: `EmptyState` linking to `/studios` (keep existing link name or update e2e in-task).
- [ ] **Step 5:** `pnpm vitest run src/features/dashboard` — PASS. `pnpm test:e2e -- dashboards guest-claim` — PASS.
- [ ] **Step 6: Commit** — `feat: restyle account bookings as ticket rail`

## Task 3: Account booking detail

**Files:**
- Modify: `src/app/account/bookings/[id]/page.tsx`
- Modify: `src/features/dashboard/presentation/booking-detail.tsx`

- [ ] **Step 1:** Header: booking code (mono, large) + status badge + primary next action for current state, in one row (stack on mobile).
- [ ] **Step 2:** Sections separated by hairline dividers with `SectionMarker` numbering: 01 Lịch studio, 02 Thanh toán, 03 Chính sách. Desktop two-column (content 8 / meta 4); mobile single column in task-priority order.
- [ ] **Step 3:** Cancellation stays an inline danger zone at the end: muted clay text action, separated from primary actions, keyboard-focusable with visible ring.
- [ ] **Step 4:** `pnpm vitest run src/features/dashboard` + `pnpm test:e2e -- dashboards` — PASS.
- [ ] **Step 5: Commit** — `feat: restyle account booking detail with sectioned layout`

## Task 4: Phase gate

- [ ] `pnpm ci:verify` — PASS; `pnpm test:e2e -- auth dashboards guest-claim assisted-lifecycle` — PASS.
- [ ] Visual QA desktop + 375px; keyboard focus order through login, register, filters, cancellation; reduced-motion static rendering.

## Success Criteria

Auth feels branded (no centered SaaS card); account history reads as a ticket rail with room accents; zero auth/booking behavior change.
