# Phase 02 Task 2 — Implementer Report

## Agent

- Implementer: `/root/p02t02_implementer`
- Scope: studios room atlas only
- Git: no stage, commit, push, branch switch, stash, or reset performed

## RED evidence

Command:

```text
pnpm vitest run src/features/studio-room/presentation/room-card.test.tsx
```

Result: expected failure, 1 failed test. The first assertion reported that the existing `article` had no `data-room-slug="photo-studio"`; the old card also had no room visual or room-specific accessible action name.

## Implementation

- Rebuilt `RoomCard` as `article.room-atlas-row` with `data-room-slug`, `RoomVisual`, service count, preserved description fallback, and preserved room route.
- Added optional `visualPriority = false`; `/studios` enables it only for the first room.
- Kept visible CTA copy as `Khám phá phòng` while exposing `Khám phá ${room.name}` as the accessible name.
- Replaced the generic three-card grid with a visual-first DOM and alternating two-column atlas from 768px. Even rows swap grid areas without changing reading order.
- Reused `PageHeading`, `RoomVisual`, `actionClassName("secondary")`, and existing warm dark semantic tokens.
- Added contextual focus/hover continuity: the room image scales only to `1.025` and the capsule border strengthens to Brass; global reduced-motion rules remain authoritative.
- Extended the catalog E2E contract for all three atlas articles, room images, hrefs, and the existing click-through flow.

## Changed files

- `src/app/studios/page.tsx`
- `src/features/studio-room/presentation/room-card.tsx`
- `src/features/studio-room/presentation/room-card.test.tsx` (new)
- `tests/e2e/public-catalog.spec.ts`
- `src/styles/utilities.css`

## GREEN and verification evidence

- Focused test: PASS — 1 file, 1 test.
- Typecheck: PASS — `tsc --noEmit`.
- Focused ESLint: PASS — all four requested TypeScript/test files.
- Full unit/integration suite: PASS — 45 files, 139 tests.
- Full suite emitted the two pre-existing redacted readiness timeout log entries but exited 0 with every test passing.

During verification, typecheck initially rejected the new test fixture's invalid `TIME_SLOT` value. Root-cause inspection confirmed the domain only accepts `ROOM_ONLY | ASSISTED`; the fixture now uses those real values. Fresh focused test and typecheck both pass.

## Accessibility and visual decisions

- Meaningful room alt text includes the room name.
- DOM order remains image then content at every breakpoint; CSS grid alone creates the desktop alternation.
- CTA inherits the shared 48px minimum target and global focus-visible treatment.
- No numeric room indices, hardcoded component colors, decorative outer glow, or new motion system were introduced.

## Concerns

- Playwright was not executed in this implementer pass; the requested E2E file was statically checked by ESLint and remains for the Phase 02 seeded E2E gate.
- `src/styles/utilities.css` is already a shared cumulative stylesheet and now exceeds the general 200-line guideline; splitting it would be outside this task's explicitly constrained file/interface scope.

Intended user-managed commit message: `feat: redesign studios as a room atlas`.
