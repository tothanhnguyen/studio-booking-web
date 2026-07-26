# Phase 02 — Public Discovery

## Task 1: Derive room assets and add `RoomVisual`

**Files:**
- Create: `public/media/rooms/photo-studio.webp`
- Create: `public/media/rooms/voice-podcast-booth.webp`
- Create: `public/media/rooms/music-studio.webp`
- Create: `src/features/studio-room/presentation/room-visual.tsx`
- Create: `src/features/studio-room/presentation/room-visual.test.tsx`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- Produces `RoomMaterial` and `RoomVisualProps` from `plan.md`.
- Unknown slugs use the full `hero-capsules-poster.webp` fallback and material `podcast`.

- [x] **Step 1: Write the failing room-visual test**

```tsx
render(<RoomVisual slug="photo-studio" alt="Photo Studio" />);
expect(screen.getByRole("img", { name: "Photo Studio" })).toHaveAttribute("src", expect.stringContaining("photo-studio.webp"));
expect(screen.getByTestId("room-visual")).toHaveAttribute("data-room-material", "photo");
```

Repeat the material assertion for `voice-podcast-booth` and `music-studio`.

- [x] **Step 2: Run the test to confirm the module is missing**

Run: `pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx`

Expected: FAIL with module-not-found.

- [x] **Step 3: Generate deterministic room crops**

Use frame 0032, whose three capsules are front-facing and separated:

```bash
mkdir -p public/media/rooms
ffmpeg -y -i public/media/hero-capsules-sequence/frame-0032.webp -vf "crop=520:480:400:60" public/media/rooms/photo-studio.webp
ffmpeg -y -i public/media/hero-capsules-sequence/frame-0032.webp -vf "crop=520:480:380:500" public/media/rooms/voice-podcast-booth.webp
ffmpeg -y -i public/media/hero-capsules-sequence/frame-0032.webp -vf "crop=520:480:820:280" public/media/rooms/music-studio.webp
```

Run: `sips -g pixelWidth -g pixelHeight public/media/rooms/*.webp`

Expected: each asset reports 520×480.

- [x] **Step 4: Implement `RoomVisual`**

Use `next/image` and this mapping:

```ts
const roomVisuals = {
  "photo-studio": { src: "/media/rooms/photo-studio.webp", material: "photo" },
  "voice-podcast-booth": { src: "/media/rooms/voice-podcast-booth.webp", material: "podcast" },
  "music-studio": { src: "/media/rooms/music-studio.webp", material: "music" },
} as const;
```

Render a `figure.room-visual` with `data-testid="room-visual"`, `data-room-material`, and an `Image` using `fill`, `sizes`, and the received `priority` value.

- [x] **Step 5: Style the capsule portal**

Add `.room-visual` with `aspect-ratio: 13 / 12`, `overflow: hidden`, `border-radius: var(--radius-lg)`, a Warm line border, and a subtle material-specific inset glow. Image movement on hover/focus-within is limited to `scale(1.025)` over `var(--motion-base)`.

- [x] **Step 6: Verify and hand off for the user-managed commit**

Run: `pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx && pnpm typecheck`

Expected: PASS.

```bash
git add public/media/rooms src/features/studio-room/presentation/room-visual.tsx src/features/studio-room/presentation/room-visual.test.tsx src/styles/utilities.css
git commit -m "feat: add room capsule visual assets"
```

## Task 2: Build the studios room atlas

**Files:**
- Modify: `src/app/studios/page.tsx`
- Modify: `src/features/studio-room/presentation/room-card.tsx`
- Create: `src/features/studio-room/presentation/room-card.test.tsx`
- Modify: `tests/e2e/public-catalog.spec.ts`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `RoomCard({ room, visualPriority? })` continues to consume `PublicRoom`; the optional boolean defaults to `false`.
- Uses `RoomVisual` and `actionClassName("secondary")` from earlier phases.

- [x] **Step 1: Write a failing room-atlas component test**

Render a room fixture and assert:

```tsx
expect(screen.getByRole("article")).toHaveAttribute("data-room-slug", "photo-studio");
expect(screen.getByRole("img", { name: /Photo Studio/i })).toBeInTheDocument();
expect(screen.getByText("2 dịch vụ")).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Khám phá Photo Studio" })).toHaveAttribute("href", "/studios/photo-studio");
```

- [x] **Step 2: Run the test to verify the old card contract fails**

Run: `pnpm vitest run src/features/studio-room/presentation/room-card.test.tsx`

Expected: FAIL because the current card has no image, data slug, or specific accessible action name.

- [x] **Step 3: Convert `RoomCard` into an atlas row**

Render `article.room-atlas-row` with a `RoomVisual` and `div.room-atlas-row__copy`. Preserve room name, description, service count, and route. Use the exact link label `Khám phá ${room.name}` while keeping visible text `Khám phá phòng`.

- [x] **Step 4: Recompose `/studios`**

Use `PageHeading` with eyebrow `Không gian`, the current title, and current description. Render rooms in `<div className="room-atlas">`; pass `visualPriority` only to the first room. Do not render numeric room indices.

- [x] **Step 5: Add alternating responsive layout**

At 768px, each atlas row uses two equal columns; even rows reverse visual/copy placement with grid areas. Below 768px, visual always appears before copy. Preserve a single-column reading order in the DOM.

- [x] **Step 6: Extend public-catalog E2E**

On `/studios`, assert three `article[data-room-slug]` elements, the three room images, and working room links. Keep existing catalog assertions.

- [x] **Step 7: Verify and hand off for the user-managed commit**

Run: `pnpm vitest run src/features/studio-room/presentation/room-card.test.tsx && pnpm typecheck`

Expected: PASS.

```bash
git add src/app/studios/page.tsx src/features/studio-room/presentation/room-card.tsx src/features/studio-room/presentation/room-card.test.tsx src/styles/utilities.css tests/e2e/public-catalog.spec.ts
git commit -m "feat: redesign studios as a room atlas"
```

## Task 3: Redesign room and service details

**Files:**
- Modify: `src/app/studios/[slug]/page.tsx`
- Modify: `src/features/service/presentation/service-card.tsx`
- Create: `src/features/service/presentation/service-card.test.tsx`
- Modify: `src/app/services/[slug]/page.tsx`
- Modify: `tests/e2e/public-catalog.spec.ts`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- `ServiceCard({ service })` signature remains unchanged.
- Room detail uses `RoomVisual` and displays only `PublicRoom` fields.
- Service detail uses only fields returned by `getPublicServiceBySlug`.

- [x] **Step 1: Write a failing service-row test**

```tsx
render(<ServiceCard service={serviceFixture} />);
expect(screen.getByRole("article")).toHaveClass("service-row");
expect(screen.getByText("60 phút")).toHaveClass("type-mono");
expect(screen.getByRole("link", { name: /Xem dịch vụ/i })).toHaveAttribute("href", `/services/${serviceFixture.slug}`);
```

- [x] **Step 2: Run the test and confirm failure**

Run: `pnpm vitest run src/features/service/presentation/service-card.test.tsx`

Expected: FAIL on the new class and mono metadata.

- [x] **Step 3: Implement the horizontal service row**

Use `article.service-row` with three regions: service type/name, description, and duration/price/action. Use hairline dividers rather than a separate filled card for each service.

- [x] **Step 4: Recompose room detail**

Render a `.room-portal` grid with `PageHeading`, `RoomVisual`, and a `.facts-rail` containing `${room.services.length} dịch vụ đang mở`. Render services below a semantic `h2` with the redesigned `ServiceCard`. Keep the current no-services empty state, but use `EmptyState`.

- [x] **Step 5: Recompose service detail**

Render `.service-sheet` with a narrative column and `aside.service-sheet__booking`. The aside must show duration, buffer, booking type, full price, `Cọc 30% khi giữ lịch`, and the current booking link. Use `position: sticky; top: 7rem` only above 900px.

- [x] **Step 6: Extend E2E contracts**

Assert room detail contains `data-testid="room-visual"`, service links still work, and service detail displays duration, price, deposit copy, and `Đặt lịch dịch vụ này`.

- [x] **Step 7: Verify and hand off for the user-managed commit**

Run: `pnpm vitest run src/features/service/presentation/service-card.test.tsx && pnpm typecheck`

Expected: PASS.

```bash
git add src/app/studios src/app/services src/features/service/presentation/service-card.tsx src/features/service/presentation/service-card.test.tsx src/styles/utilities.css tests/e2e/public-catalog.spec.ts
git commit -m "feat: redesign room and service details"
```

## Phase 02 Gate

- [x] Run `pnpm vitest run src/features/studio-room/presentation src/features/service/presentation` and expect PASS.
- [x] Run the seeded `tests/e2e/public-catalog.spec.ts` and expect PASS.
- [x] Inspect `/studios`, each room, and one service at 1440px and 375px; confirm no numeric room ordering, no overflow, and no generic three-card grid.
