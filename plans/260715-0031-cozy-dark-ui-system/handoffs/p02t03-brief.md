# Phase 02 Task 3 — Room and Service Details

## Ownership and safety

- Implementer: `/root/p02t03_implementer`.
- Work only in `/Users/thanhnguyen/Documents/MowStudio` on existing branch `tnguyen/phase7.2`.
- Never stage, commit, push, switch branches, stash, reset, clean, or revert existing work. The user owns Git.
- Follow TDD and write `handoffs/p02t03-report.md`.

## Files

- Modify: `src/app/studios/[slug]/page.tsx`
- Modify: `src/features/service/presentation/service-card.tsx`
- Create: `src/features/service/presentation/service-card.test.tsx`
- Modify: `src/app/services/[slug]/page.tsx`
- Modify: `tests/e2e/public-catalog.spec.ts`
- Modify: `src/styles/utilities.css`

## Contracts

- Keep `ServiceCard({ service })` unchanged.
- Room detail may display only fields from `PublicRoom`; service detail only fields returned by `getPublicServiceBySlug`.
- Use completed `RoomVisual`, `PageHeading`, `EmptyState`, and `actionClassName` primitives where specified.
- Preserve current routes, not-found behavior, metadata, business data, and booking link.
- Maintain the approved cozy, dark, minimal Cinematic Continuity direction.

## TDD and implementation

1. Add a failing `service-card.test.tsx` that renders a real-domain fixture and asserts `article.service-row`, `${durationMinutes} phút` with `.type-mono`, and the existing `/services/${slug}` action named `Xem dịch vụ`.
2. Run `pnpm vitest run src/features/service/presentation/service-card.test.tsx`; record the expected RED failure on the new class/mono metadata.
3. Implement a horizontal `article.service-row` with three regions: service type/name, description, and duration/price/action. Use hairline dividers, not filled card tiles. Preserve description fallback, price, booking-type label, link name, and route.
4. Recompose room detail as `.room-portal`: `PageHeading`, `RoomVisual`, and `.facts-rail` with exact copy `${room.services.length} dịch vụ đang mở`. Below it, render a semantic `h2` and redesigned `ServiceCard` rows. For no services, use `EmptyState` with the current meaning.
5. Recompose service detail as `.service-sheet` with narrative column and `aside.service-sheet__booking`. The aside shows duration, buffer, booking type, full price, exact copy `Cọc 30% khi giữ lịch`, and the existing link `Đặt lịch dịch vụ này`. Only above 900px may it use `position: sticky; top: 7rem`.
6. Extend the existing public catalog E2E: room detail has `data-testid="room-visual"`; service links still navigate; service detail shows duration, price, deposit copy, and `Đặt lịch dịch vụ này`. Preserve Task 02.2 assertions.
7. Verify:

```text
pnpm vitest run src/features/service/presentation/service-card.test.tsx
pnpm typecheck
pnpm eslint 'src/app/studios/[slug]/page.tsx' src/features/service/presentation/service-card.tsx src/features/service/presentation/service-card.test.tsx 'src/app/services/[slug]/page.tsx' tests/e2e/public-catalog.spec.ts
pnpm test
```

## Report

Document RED/GREEN evidence, changed files, focused/full verification, data-contract/accessibility decisions, and concerns. Do not commit. Intended user-managed commit message: `feat: redesign room and service details`.
