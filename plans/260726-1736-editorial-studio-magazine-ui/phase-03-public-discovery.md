# Phase 3 — Public Discovery: Magazine Index, Cover Story, Spec Sheet

**Context:** `plan.md`, spec §5.1–5.3. Consumes Phase 1 primitives and Phase 2 imagery.
**Priority:** High — most-seen customer pages.
**Status:** Not started

**Shared rules for every task in this phase:**
- Read the current page/component before editing; preserve data fetching, route params, and all server logic — presentation changes only.
- Reuse `PageHeading`, `actionClassName`, `EmptyState` where already used; add `SectionMarker`, `ScrollReveal`, `Marquee`, `ParallaxFrame` from `src/components/ui/`.
- New CSS classes go in `src/styles/editorial.css` (create page-scoped blocks with a `.studio-index-`, `.room-story-`, `.service-sheet-` prefix). If the file approaches 200 lines, split into `src/styles/editorial-pages.css` and import it from `globals.css`.
- Any change to a heading, link label, or accessible name must update the matching assertions in unit tests and `tests/e2e/public-catalog.spec.ts` in the same task.
- Apply the `page-grain` class to the page root of every public page in this phase (`/studios`, `/studios/[slug]`, `/services/[slug]`).

## Task 1: `/studios` — magazine index

**Files:**
- Modify: `src/app/studios/page.tsx`
- Modify: `src/features/studio-room/presentation/room-card.tsx`
- Test: `src/features/studio-room/presentation/room-card.test.tsx`, `tests/e2e/public-catalog.spec.ts`

**Interfaces:**
- Consumes: `SectionMarker`, `ScrollReveal`, `ParallaxFrame`, `Marquee`, `RoomVisual` (hero variant).
- Produces: `RoomCard` accepts a new required `index: number` prop (1-based) and renders `SectionMarker(index, room name context)`.

- [ ] **Step 1 (test first):** Update `room-card.test.tsx` — add:

```tsx
it("renders its magazine index marker", () => {
  render(<RoomCard index={2} room={roomFixture} />);
  expect(screen.getByText("02")).toBeInTheDocument();
});
```

Run: FAIL (prop not accepted).

- [ ] **Step 2:** Restyle `RoomCard` as an alternating editorial row:
  - Root: `<article className="studio-index-row">` with `data-align={index % 2 === 0 ? "right" : "left"}`.
  - Visual column: `ParallaxFrame` wrapping `RoomVisual` (hero, `priority` for index 1).
  - Content column: `SectionMarker(index, "Phòng")`, room name in `<h2 className="display-lg">`, description, service count in mono, action link via `actionClassName("secondary")` — keep the existing accessible link name unless updating e2e in the same step.
  - Wrap content column in `ScrollReveal`.
- [ ] **Step 3:** CSS in `editorial.css`: `.studio-index-row` = 12-col grid, visual spans 7, content 5; `[data-align="right"]` flips column order via `direction`-safe `order`; mobile (<768px) stacks visual first; row gap ≥ `6rem`.
- [ ] **Step 4:** In `studios/page.tsx`: intro block gets `display-xl` headline + `ScrollReveal`; insert `<Marquee items={["Photo Studio", "Podcast Booth", "Music Studio", "Đặt lịch", "MowStudio"]} />` between intro and rows; pass `index={i + 1}` to each `RoomCard`; add `page-grain` class to the page root section.
- [ ] **Step 5:** Run `pnpm vitest run src/features/studio-room` — PASS. Run `pnpm test:e2e -- public-catalog` (needs seeded DB) or defer to phase gate with a note.
- [ ] **Step 6: Commit** — `feat: restyle studios page as editorial magazine index`

## Task 2: `/studios/[slug]` — cover story

**Files:**
- Modify: `src/app/studios/[slug]/page.tsx`
- Test: `tests/e2e/public-catalog.spec.ts` (only if copy/names change)

- [ ] **Step 1:** Opening: full-bleed `ParallaxFrame` + `RoomVisual` hero (60–70vh via `.room-story-hero { min-block-size: clamp(24rem, 65vh, 44rem); }`), room name as `<h1 className="display-xl room-story-title">` overlapping the image bottom edge (negative margin, `position: relative`), short description beneath.
- [ ] **Step 2:** Facts rail: existing available data only (service count, room material label) in mono, `.room-story-facts` horizontal rail with hairline dividers.
- [ ] **Step 3:** Services list: editorial feature rows — each service row pairs `RoomVisual` `variant="detail-1"`/`"detail-2"` (alternate) with name, duration/price in mono, and the existing booking link. Wrap rows in `ScrollReveal` with staggered `delayMs={i * 80}` (cap 240).
- [ ] **Step 4:** Closing CTA block: `SectionMarker(services.length + 1, "Đặt lịch")` + primary action (existing label).
- [ ] **Step 5:** Verify heading hierarchy (`h1` → `h2` per service) unchanged for e2e; run `pnpm vitest run` affected suites + typecheck.
- [ ] **Step 6: Commit** — `feat: restyle room detail as editorial cover story`

## Task 3: `/services/[slug]` — spec sheet

**Files:**
- Modify: `src/app/services/[slug]/page.tsx`
- Modify: `src/features/service/presentation/service-card.tsx` (only if shared markup lives here)
- Test: `src/features/service/presentation/service-card.test.tsx`, `tests/e2e/public-catalog.spec.ts`

- [ ] **Step 1:** Desktop 7/5 grid `.service-sheet`: left column = `SectionMarker(1, "Dịch vụ")`, `h1.display-lg`, description, room context link, booking-type explanation with section markers 02/03.
- [ ] **Step 2:** Right column = sticky `.service-sheet-rate-card` (existing price panel restyled): `position: sticky; top: 6rem;` — mono price/duration/buffer, 30% deposit line, single primary action (existing accessible name). Raised surface + 1px border, radius `var(--radius-md)`.
- [ ] **Step 3:** Mobile: rate card renders directly after the `h1` (source order already mobile-first — verify; adjust with CSS `order` inside the grid only on desktop).
- [ ] **Step 4:** Exactly one primary action visible per viewport; no content obscured by stickiness at 375px.
- [ ] **Step 5:** Run unit suite + typecheck — PASS.
- [ ] **Step 6: Commit** — `feat: restyle service detail as editorial spec sheet`

## Task 4: Phase gate

- [ ] `pnpm ci:verify` — PASS.
- [ ] `pnpm test:e2e -- public-catalog home-hero` against seeded PostgreSQL — PASS.
- [ ] Visual QA at 1440px and 375px: alternating rows collapse correctly, marquee loops seamlessly, parallax subtle (≤16px), reduced-motion shows everything static and visible, no horizontal overflow.
- [ ] Lighthouse spot check on `/studios`: CLS < 0.02.

## Success Criteria

Public pages read as one editorial magazine: numbered rooms, display serif headlines, graded imagery with parallax, marquee divider — with all existing links, data, and e2e behavior intact.
