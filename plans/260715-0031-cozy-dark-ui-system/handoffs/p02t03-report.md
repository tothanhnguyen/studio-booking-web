# Phase 02 Task 3 — Implementation Report

## Status

Complete and ready for review. No Git state was changed; nothing was staged, committed, pushed, switched, stashed, reset, cleaned, or reverted.

## TDD evidence

- RED: added `service-card.test.tsx` before changing production code.
- RED command: `pnpm vitest run src/features/service/presentation/service-card.test.tsx`.
- Expected failure: the real rendered `article` did not have class `service-row`; received the previous filled-card utility classes.
- GREEN: implemented the horizontal service row and reran the same command.
- GREEN result: 1 file passed, 1 test passed.
- Refactor verification after the final CSS specificity cleanup: 1 file passed, 1 test passed.

## Changed files

- `src/app/studios/[slug]/page.tsx`
  - Rebuilt the room detail as `.room-portal` using `PageHeading`, `RoomVisual`, `.facts-rail`, `ServiceCard`, and `EmptyState`.
  - Added the exact active-service count copy: `${room.services.length} dịch vụ đang mở`.
- `src/features/service/presentation/service-card.tsx`
  - Preserved `ServiceCard({ service })` while replacing filled tiles with a semantic three-region `article.service-row`.
  - Preserved booking-type label, description fallback, duration, price, link name, and service route.
- `src/features/service/presentation/service-card.test.tsx`
  - Added a real `ServiceRecord` fixture and assertions for row semantics, mono duration, and the existing service link.
- `src/app/services/[slug]/page.tsx`
  - Rebuilt the detail as a narrative column and `aside.service-sheet__booking`.
  - Preserved not-found behavior, metadata, service fallback copy, and `/booking/${service.id}` route.
  - Added duration, buffer, booking type, full price, and exact deposit copy.
- `tests/e2e/public-catalog.spec.ts`
  - Preserved Task 02.2 discovery assertions and extended the same path through room visual, service navigation, detail facts, deposit copy, and booking action.
- `src/styles/utilities.css`
  - Added token-driven cozy dark styles for room portal, horizontal rows, service sheet, tabular mono facts, and responsive behavior.
  - Sticky booking aside is only enabled at `min-width: 901px` with `top: 7rem`.

## Verification

- `pnpm vitest run src/features/service/presentation/service-card.test.tsx`: pass, 1/1.
- `pnpm typecheck`: pass.
- `pnpm eslint 'src/app/studios/[slug]/page.tsx' src/features/service/presentation/service-card.tsx src/features/service/presentation/service-card.test.tsx 'src/app/services/[slug]/page.tsx' tests/e2e/public-catalog.spec.ts`: pass.
- `pnpm test`: pass, 46 files and 140 tests.
- `git diff --check` for the five tracked task files: pass.
- Playwright was intentionally not run; the brief assigns it to the Phase 02 gate.

The full unit run emitted the two existing redacted readiness timeout log entries; they remained non-failing and unrelated to this task.

## Contract and accessibility decisions

- Room detail reads only `PublicRoom` fields; no equipment, gallery, or invented content model was introduced.
- Service detail reads only fields returned by `getPublicServiceBySlug`; no extra repository query or room/domain change was added.
- Static booking-type guidance is derived from the existing `bookingType` value.
- Semantic `h1`/`h2` structure, `article`, `aside`, `dl`/`dt`/`dd`, accessible link names, visible global focus treatment, and shared minimum-size action primitives are retained.
- Price, duration, and buffer use IBM Plex Mono with tabular numerals.
- Hairline dividers replace generic filled service cards; the single booking aside remains the primary warm surface.

## Concerns

- Visual and Playwright smoke verification remains for the Phase 02 gate, as requested.
- No unresolved implementation concern.

## Intended user-managed commit

`feat: redesign room and service details`

## Fix response — booking type copy

- Addressed the reviewer’s Important finding in `src/app/services/[slug]/page.tsx`.
- Replaced the inferred assistance promises with enum-only descriptions:
  - `ASSISTED`: `Dịch vụ này thuộc hình thức có hỗ trợ.`
  - `ROOM_ONLY`: `Dịch vụ này thuộc hình thức chỉ thuê phòng.`
- The service sheet no longer implies team presence, assistance scope, user behavior, or full-session coverage that the public-service contract does not guarantee.
- Post-fix focused test, typecheck, and focused service-page ESLint all passed.
