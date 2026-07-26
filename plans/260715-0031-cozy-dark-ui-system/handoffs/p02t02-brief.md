# Phase 02 Task 2 — Studios Room Atlas

## Ownership and safety

- Implementer: `/root/p02t02_implementer`.
- Work only in `/Users/thanhnguyen/Documents/MowStudio` on the existing branch `tnguyen/phase7.2`.
- Do not stage, commit, push, switch branches, stash, reset, or otherwise mutate Git state. The user owns Git.
- Preserve all existing dirty/untracked changes; do not clean or revert files outside this task.
- Follow TDD and leave a report at `handoffs/p02t02-report.md`.

## Files

- Modify: `src/app/studios/page.tsx`
- Modify: `src/features/studio-room/presentation/room-card.tsx`
- Create: `src/features/studio-room/presentation/room-card.test.tsx`
- Modify: `tests/e2e/public-catalog.spec.ts`
- Modify: `src/styles/utilities.css`

## Contract

- `RoomCard({ room, visualPriority? })` continues to consume `PublicRoom`; `visualPriority` is optional and defaults to `false`.
- Use the completed `RoomVisual`, `PageHeading`, and `actionClassName("secondary")` primitives.
- Preserve current public room data and routes. No domain, database, auth, or route changes.
- Keep the approved cozy, dark, minimal Cinematic Continuity direction.

## TDD steps

1. Create the failing room-card test. Render a room fixture and assert:

```tsx
expect(screen.getByRole("article")).toHaveAttribute("data-room-slug", "photo-studio");
expect(screen.getByRole("img", { name: /Photo Studio/i })).toBeInTheDocument();
expect(screen.getByText("2 dịch vụ")).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Khám phá Photo Studio" })).toHaveAttribute("href", "/studios/photo-studio");
```

2. Run `pnpm vitest run src/features/studio-room/presentation/room-card.test.tsx` and record the expected RED failure because the current card lacks the visual, data slug, and specific accessible action name.
3. Convert `RoomCard` to `article.room-atlas-row`, containing `RoomVisual` plus `div.room-atlas-row__copy`. Preserve name, description, service count, and route. The link's accessible name must be `Khám phá ${room.name}` while visible text remains `Khám phá phòng`.
4. Recompose `/studios` using `PageHeading` with eyebrow `Không gian`, the current title, and current description. Render rooms in `.room-atlas`; only the first room receives `visualPriority`. Do not render numeric room indices.
5. Style an alternating responsive atlas. From 768px, each row has two equal columns and even rows reverse visual/copy placement with grid areas. Below 768px, the visual appears first. Preserve single-column reading order in the DOM. Use shared warm dark tokens and avoid a generic three-card grid.
6. Extend `tests/e2e/public-catalog.spec.ts`: on `/studios`, assert three `article[data-room-slug]` elements, all three room images, and working room links. Preserve existing catalog assertions; update selectors only as required by the new accessible action labels.
7. Verify:

```text
pnpm vitest run src/features/studio-room/presentation/room-card.test.tsx
pnpm typecheck
pnpm eslint src/app/studios/page.tsx src/features/studio-room/presentation/room-card.tsx src/features/studio-room/presentation/room-card.test.tsx tests/e2e/public-catalog.spec.ts
pnpm test
```

## Report

Document RED/GREEN evidence, changed files, focused/full verification, any visual/accessibility decisions, and concerns. Do not commit; intended user-managed commit message: `feat: redesign studios as a room atlas`.
