# Phase 06 — Cross-page QA and Polish

## Task 1: Add responsive and reduced-motion E2E contracts

**Files:**
- Create: `tests/e2e/ui-system.spec.ts`
- Modify: `playwright.config.ts` only if the current projects do not expose mobile and reduced-motion coverage.

**Interfaces:**
- Tests public routes without authentication and seeded account/admin routes through existing fixtures and helpers.
- Does not add an accessibility dependency.

- [ ] **Step 1: Write the public no-overflow test**

```ts
test("public pages do not overflow at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/studios", "/studios/photo-studio"]) {
    await page.goto(path);
    const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBe(widths.client);
  }
});
```

- [ ] **Step 2: Add keyboard focus coverage**

On `/studios`, press Tab until the first room action receives focus and assert its outline style is not `none` and its outline width is at least 2px.

- [ ] **Step 3: Add reduced-motion coverage**

Use `page.emulateMedia({ reducedMotion: "reduce" })`, navigate to `/studios`, and assert the room visual's computed transition duration is `0.01ms` or `0s`. Keep the existing hero reduced-motion test unchanged.

- [ ] **Step 4: Run the new spec**

Run: `pnpm playwright test tests/e2e/ui-system.spec.ts --project=chromium`

Expected: PASS after the UI phases are complete.

- [ ] **Step 5: Commit E2E contracts**

```bash
git add tests/e2e/ui-system.spec.ts playwright.config.ts
git commit -m "test: add UI system responsive contracts"
```

## Task 2: Run automated verification and fix regressions

**Files:**
- Modify only files implicated by a failing check.

- [ ] **Step 1: Run repository verification**

Run: `pnpm ci:verify`

Expected: Prisma generation, ESLint, TypeScript, and Vitest all exit 0.

- [ ] **Step 2: Run PostgreSQL integration tests**

Start PostgreSQL 18 and run the integration suite first:

```bash
docker compose -f docker-compose.test.yml up -d --wait
pnpm test:integration
docker compose -f docker-compose.test.yml down -v
```

Expected: integration tests PASS and the test database is removed cleanly.

- [ ] **Step 3: Run production build**

Run: `pnpm build`

Expected: Next.js production build exits 0 with all routes compiled.

- [ ] **Step 4: Run critical E2E**

Run: `pnpm test:e2e:critical`

Expected: guest booking, room-only payment, public catalog, and admin denial all PASS.

- [ ] **Step 5: Run UI-sensitive E2E suites**

Run:

```bash
pnpm playwright test tests/e2e/auth.spec.ts tests/e2e/dashboards.spec.ts tests/e2e/admin-catalog.spec.ts tests/e2e/admin-schedule.spec.ts tests/e2e/assisted-lifecycle.spec.ts tests/e2e/ui-system.spec.ts --project=chromium
```

Expected: PASS.

- [ ] **Step 6: Fix each failure at its source**

For a failure, rerun only the failing test with `--trace on`, inspect the trace, make the smallest source change, rerun the focused test, then rerun the parent command. Do not loosen assertions that protect route behavior, accessible names, authorization, or business state.

- [ ] **Step 7: Commit verified fixes**

Stage only files changed to fix verification and commit with a scope-specific conventional message, for example:

```bash
git add src tests
git commit -m "fix: resolve UI system verification regressions"
```

Skip this commit when no fixes were required.

## Task 3: Complete visual and interaction QA

**Files:**
- Create: `plans/260715-0031-cozy-dark-ui-system/qa-report.md`

- [ ] **Step 1: Start the production build locally**

Run: `pnpm start`

Expected: server ready at `http://localhost:3000`.

- [ ] **Step 2: Capture representative desktop screens**

Capture 1440×1000 screenshots for `/studios`, one room, one service, one booking step, payment, account bookings, admin bookings, and admin schedule. Save temporary images under `/tmp/mow-ui-qa/`; do not commit them.

- [ ] **Step 3: Capture representative mobile screens**

Capture the same route families at 390×844. Verify header/menu, single-column order, sticky behavior, action reachability, and absence of horizontal overflow.

- [ ] **Step 4: Inspect design consistency**

Record pass/fail for these exact checks:

- Background remains Void/Ink/Espresso without cool light surfaces.
- Bone text and Champagne action hierarchy are consistent.
- Capsule window dominates no more than one region per viewport.
- Public room materials are identifiable without recoloring the whole page.
- Booking/account/admin motion is quieter than the hero.
- Admin rows scan faster than the original large-card layout.
- QR remains high contrast and scannable on Bone.

- [ ] **Step 5: Inspect keyboard and reduced motion manually**

Navigate public, booking, account, and admin representative pages using Tab/Shift+Tab. Repeat with reduced motion enabled. Record any focus trap, invisible focus, motion, or disclosure issue.

- [ ] **Step 6: Write the QA report**

Create `qa-report.md` with environment, commands run, route/viewport matrix, pass/fail results, fixes made, and an `Unresolved questions` section containing `None` when clear.

- [ ] **Step 7: Commit QA evidence**

```bash
git add plans/260715-0031-cozy-dark-ui-system/qa-report.md
git commit -m "docs: record cozy dark UI verification"
```

## Final Gate

- [ ] Confirm `git status --short` contains no unintended files or generated screenshots.
- [ ] Confirm every phase checkbox is complete and update `plan.md` status to `Completed`.
- [ ] Run `pnpm ci:verify` one final time and expect exit 0.
- [ ] Run `pnpm test:integration` against PostgreSQL 18 one final time and expect exit 0.
- [ ] Run `pnpm build` one final time and expect exit 0.
- [ ] Review `git diff` from the plan-start commit and confirm no domain, schema, API, authorization, or route behavior changes.
