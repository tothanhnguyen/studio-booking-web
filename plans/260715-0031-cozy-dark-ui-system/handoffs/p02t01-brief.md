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

- [ ] **Step 1: Write the failing room-visual test**

```tsx
render(<RoomVisual slug="photo-studio" alt="Photo Studio" />);
expect(screen.getByRole("img", { name: "Photo Studio" })).toHaveAttribute("src", expect.stringContaining("photo-studio.webp"));
expect(screen.getByTestId("room-visual")).toHaveAttribute("data-room-material", "photo");
```

Repeat the material assertion for `voice-podcast-booth` and `music-studio`.

- [ ] **Step 2: Run the test to confirm the module is missing**

Run: `pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Generate deterministic room crops**

Use frame 0032, whose three capsules are front-facing and separated:

```bash
mkdir -p public/media/rooms
ffmpeg -y -i public/media/hero-capsules-sequence/frame-0032.webp -vf "crop=520:480:400:60" public/media/rooms/photo-studio.webp
ffmpeg -y -i public/media/hero-capsules-sequence/frame-0032.webp -vf "crop=520:480:380:500" public/media/rooms/voice-podcast-booth.webp
ffmpeg -y -i public/media/hero-capsules-sequence/frame-0032.webp -vf "crop=520:480:820:280" public/media/rooms/music-studio.webp
```

Run: `sips -g pixelWidth -g pixelHeight public/media/rooms/*.webp`

Expected: each asset reports 520×480.

- [ ] **Step 4: Implement `RoomVisual`**

Use `next/image` and this mapping:

```ts
const roomVisuals = {
  "photo-studio": { src: "/media/rooms/photo-studio.webp", material: "photo" },
  "voice-podcast-booth": { src: "/media/rooms/voice-podcast-booth.webp", material: "podcast" },
  "music-studio": { src: "/media/rooms/music-studio.webp", material: "music" },
} as const;
```

Render a `figure.room-visual` with `data-testid="room-visual"`, `data-room-material`, and an `Image` using `fill`, `sizes`, and the received `priority` value.

- [ ] **Step 5: Style the capsule portal**

Add `.room-visual` with `aspect-ratio: 13 / 12`, `overflow: hidden`, `border-radius: var(--radius-lg)`, a Warm line border, and a subtle material-specific inset glow. Image movement on hover/focus-within is limited to `scale(1.025)` over `var(--motion-base)`.

- [ ] **Step 6: Verify and commit**

Run: `pnpm vitest run src/features/studio-room/presentation/room-visual.test.tsx && pnpm typecheck`

Expected: PASS.

```bash
git add public/media/rooms src/features/studio-room/presentation/room-visual.tsx src/features/studio-room/presentation/room-visual.test.tsx src/styles/utilities.css
git commit -m "feat: add room capsule visual assets"
```

