# Phase 6 — Admin: Refined Density

**Context:** `plan.md`, spec §5.7. No bold motion here: no parallax, marquee, or scroll reveals; micro-interactions ≤ 220ms (`--motion-fast`/`--motion-base`) only.
**Priority:** Medium.
**Status:** Not started

**Hard rules:** Warm-light theme stays; no cool/light-generic dashboard styling. No authorization, query, or mutation changes. Accessible names in `tests/e2e/admin-catalog.spec.ts`, `admin-schedule.spec.ts`, `admin-denial.spec.ts`, `dashboards.spec.ts` change only with same-task test updates.

## Task 1: Admin shell and navigation

**Files:**
- Modify: `src/features/dashboard/presentation/admin-shell.tsx`
- Modify: `src/features/dashboard/presentation/admin-nav.tsx` if present (verify: nav may live inside admin-shell.tsx — read first)
- Modify: `src/app/admin/layout.tsx` (composition only)

- [ ] **Step 1:** Sticky ~240px nav rail, groups labeled with mono uppercase eyebrows (Vận hành / Tài chính / Cấu hình — keep existing link names). Active item: inset pill (Surface fill + 1px border) + 3px Action indicator bar. Hover/focus transitions ≤ `--motion-fast`.
- [ ] **Step 2:** Mobile: compact top bar with the existing nav mechanism (drawer/select); ≥44px targets; no second horizontal scroll.
- [ ] **Step 3:** `pnpm typecheck && pnpm vitest run src/features/dashboard` — PASS. Commit: `feat: refine admin shell navigation density`

## Task 2: Dashboard + booking operations views

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/features/dashboard/presentation/booking-list.tsx`, `booking-status-badge.tsx`
- Modify: `src/app/admin/bookings/page.tsx`, `src/app/admin/bookings/[id]/page.tsx`, `src/app/admin/payments/page.tsx`
- Test: `tests/e2e/dashboards.spec.ts`, `admin-denial.spec.ts` (names only if changed)

- [ ] **Step 1:** Admin dashboard: `PageHeading` with `SectionMarker`-numbered sections; real data only (booking total, quick actions, recent bookings) — no invented KPI cards.
- [ ] **Step 2:** `booking-list.tsx`: compact desktop rows — columns for mono date/time, mono code, customer, service/room, mono amount, status badge; hairline row dividers; row hover = Surface tint at `--motion-fast`. Mobile: each row becomes a stacked block keeping all actions visible.
- [ ] **Step 3:** `booking-status-badge.tsx`: muted semantic colors + mandatory text label (verify AA contrast for each state on Surface).
- [ ] **Step 4:** Booking detail + payments pages: mono for money/codes/times; sections with hairline dividers; primary/destructive actions visually separated.
- [ ] **Step 5:** `pnpm vitest run src/features/dashboard` — PASS. Commit: `feat: refine admin booking and payment views`

## Task 3: Calendar and schedule

**Files:**
- Modify: `src/features/dashboard/presentation/booking-calendar.tsx`
- Modify: `src/app/admin/bookings/calendar/page.tsx`, `src/app/admin/schedule/page.tsx`, `src/app/admin/blocked-slots/page.tsx`
- Test: `src/features/dashboard/presentation/booking-calendar.test.tsx`, `tests/e2e/admin-schedule.spec.ts`

- [ ] **Step 1:** Calendar stays an agenda grouped by day (no month/week grid): day headers in mono with hairline rule, entries as compact rows (time range mono, room accent bar, service, status).
- [ ] **Step 2:** Working hours + block creation forms share `FormField` language; blocked slots render as an agenda/timeline emphasizing room and time range; delete = muted clay text action with visible focus.
- [ ] **Step 3:** Run `pnpm vitest run src/features/dashboard/presentation/booking-calendar.test.tsx` — PASS (update markup assertions in-task if class names moved; behavior identical).
- [ ] **Step 4:** Commit: `feat: refine admin calendar and schedule agenda`

## Task 4: Room and service management

**Files:**
- Modify: `src/app/admin/rooms/page.tsx`, `src/app/admin/services/page.tsx`
- Modify: `src/features/studio-room/presentation/room-form.tsx`, `src/features/service/presentation/service-form.tsx`

- [ ] **Step 1:** New-item form in one panel at top (Raised surface, 1px border, radius `--radius-md`); existing records as compact summaries below, revealing edit controls via the existing mechanism.
- [ ] **Step 2:** Save = primary; hide/reactivate = secondary, visually separate; destructive actions never share the primary group.
- [ ] **Step 3:** `pnpm vitest run src/features/studio-room src/features/service` + `pnpm test:e2e -- admin-catalog` — PASS.
- [ ] **Step 4:** Commit: `feat: refine admin catalog management forms`

## Task 5: Phase gate

- [ ] `pnpm ci:verify` + `pnpm build` — PASS.
- [ ] `pnpm test:e2e -- admin-catalog admin-schedule admin-denial dashboards` — PASS.
- [ ] Visual QA desktop + 375px; keyboard through forms and destructive actions; confirm zero parallax/marquee/reveal in admin.

## Success Criteria

Admin scans faster (mono data, compact rows, agenda views) while staying warm-light and calm; no behavior or authorization change.
