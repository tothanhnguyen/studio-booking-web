# Editorial Studio Magazine UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade every MowStudio page (except the finished home hero) to the approved Editorial Studio Magazine direction: warm-light palette, Fraunces display typography, bold-but-disciplined motion, and a newly generated, consistently graded room photo set.

**Architecture:** Extend the existing token/primitive foundation (`src/styles/*`, `src/components/ui/*`) with editorial typography, texture, and four motion primitives; generate and grade the image set; then restyle one page family per phase (public → booking → auth/account → admin) without touching routes, domain logic, API contracts, or booking state transitions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, CSS custom properties, `next/font` (Fraunces, Plus Jakarta Sans, IBM Plex Mono), Vitest + Testing Library, Playwright, `ai-multimodal` skill (image generation), `imagemagick` skill (grading/optimization).

## Global Constraints

- Source of truth: `docs/superpowers/specs/2026-07-26-editorial-studio-magazine-ui-design.md`.
- Warm-light palette only, from `src/styles/tokens.css`: Canvas `#E7E1D8`, Surface `#F7F5EF`, Raised `#FFFDF8`, Text `#1A1B18`, Action `#254238`. No dark theme anywhere.
- Home hero (`src/features/home/presentation/*`, `src/styles/hero.css`, `public/media/hero-capsules-*`) is untouched.
- Preserve all route URLs, server actions, domain rules, database schema, API contracts, authorization, and booking state transitions.
- Fonts: Fraunces = display only; Plus Jakarta Sans = body/UI; IBM Plex Mono = codes, prices, times, status metadata.
- All new motion is transform/opacity only, and fully removed under `prefers-reduced-motion`; content must remain visible without JS-triggered reveals.
- Admin gets no parallax/marquee/scroll-reveal; micro-interactions ≤ 220ms only.
- WCAG AA contrast, visible keyboard focus, ≥44px touch targets, no horizontal overflow at 375px, CLS ≈ 0 from new motion.
- Accessible names used by e2e specs (`tests/e2e/*.spec.ts`) change only together with the corresponding test update in the same task.
- Keep focused source files under 200 lines where practical; new CSS goes to `src/styles/editorial.css`, not `utilities.css` (already 816 lines).
- Commit steps: if the executing session has not been granted commit permission by the user, treat each commit step as a handoff boundary — report the intended message and leave changes uncommitted.
- Run `pnpm ci:verify` (lint + typecheck + vitest) after each phase; it must pass before the next phase starts.

## File Map

### Phase 1 — Foundation
- Modify: `src/app/layout.tsx` (register Fraunces as `--font-display`)
- Modify: `src/styles/tokens.css` (display scale, marquee duration, grain token)
- Create: `src/styles/editorial.css` (display type, grain, section marker, marquee, reveal, parallax rules)
- Modify: `src/app/globals.css` (import editorial.css)
- Create: `src/components/ui/scroll-reveal.tsx` + `scroll-reveal.test.tsx`
- Create: `src/components/ui/marquee.tsx` + `marquee.test.tsx`
- Create: `src/components/ui/section-marker.tsx` + `section-marker.test.tsx`
- Create: `src/components/ui/parallax-frame.tsx` + `parallax-frame.test.tsx`

### Phase 2 — Imagery
- Overwrite: `public/media/rooms/photo-studio.webp`, `voice-podcast-booth.webp`, `music-studio.webp`
- Create: `public/media/rooms/{slug}-detail-1.webp`, `{slug}-detail-2.webp` (3 rooms)
- Create: `public/media/brand/auth-statement.webp`
- Modify: `src/features/studio-room/presentation/room-visual.tsx` (add `variant` prop)

### Phase 3 — Public discovery
- Modify: `src/app/studios/page.tsx`, `src/features/studio-room/presentation/room-card.tsx`
- Modify: `src/app/studios/[slug]/page.tsx`
- Modify: `src/app/services/[slug]/page.tsx`, `src/features/service/presentation/service-card.tsx`
- Tests: `room-card.test.tsx`, `service-card.test.tsx`, `tests/e2e/public-catalog.spec.ts`

### Phase 4 — Booking ticket
- Modify: `src/features/booking/presentation/booking-progress.tsx`, `booking-wizard.tsx`, `booking-summary.tsx`
- Modify: `src/features/payment/presentation/vietqr-payment.tsx`, `payment-status.tsx`
- Modify: `src/app/booking/[id]/page.tsx`, `payment/page.tsx`, `confirmation/page.tsx`
- Tests: `booking-progress.test.tsx`, `booking-wizard.test.tsx`, `tests/e2e/guest-booking.spec.ts`, `room-only-payment.spec.ts`

### Phase 5 — Auth + account
- Modify: `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/features/auth/presentation/auth-form.tsx`, `claim-bookings-banner.tsx`
- Modify: `src/app/account/bookings/page.tsx`, `[id]/page.tsx`, `src/features/dashboard/presentation/booking-detail.tsx`, `booking-filters.tsx`
- Tests: `tests/e2e/auth.spec.ts`, `guest-claim.spec.ts`, `dashboards.spec.ts`

### Phase 6 — Admin refinement
- Modify: `src/features/dashboard/presentation/admin-shell.tsx`, `booking-list.tsx`, `booking-calendar.tsx`, `booking-status-badge.tsx`
- Modify: `src/app/admin/**/page.tsx` (headings/density only)
- Tests: `booking-calendar.test.tsx`, `tests/e2e/admin-catalog.spec.ts`, `admin-schedule.spec.ts`, `dashboards.spec.ts`

### Phase 7 — QA and polish
- Cross-page verification only; fixes land in the files above.

## Stable Interfaces

These names are shared across phase files and must not drift:

```ts
// src/components/ui/scroll-reveal.tsx
export type ScrollRevealProps = Readonly<{
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}>;
export function ScrollReveal(props: ScrollRevealProps): React.JSX.Element;

// src/components/ui/marquee.tsx
export type MarqueeProps = Readonly<{ items: readonly string[]; className?: string }>;
export function Marquee(props: MarqueeProps): React.JSX.Element;

// src/components/ui/section-marker.tsx
export type SectionMarkerProps = Readonly<{ index: number; label: string }>;
export function SectionMarker(props: SectionMarkerProps): React.JSX.Element;

// src/components/ui/parallax-frame.tsx
export type ParallaxFrameProps = Readonly<{
  children: React.ReactNode;
  amplitude?: number; // px, default 16
  className?: string;
}>;
export function ParallaxFrame(props: ParallaxFrameProps): React.JSX.Element;

// src/features/studio-room/presentation/room-visual.tsx (extended)
export type RoomVisualVariant = "hero" | "detail-1" | "detail-2";
export type RoomVisualProps = Readonly<{
  slug: string;
  alt: string;
  priority?: boolean;
  className?: string;
  variant?: RoomVisualVariant; // default "hero"
}>;
```

Existing interfaces that must keep working unchanged: `actionClassName(variant, compact)`, `PageHeading`, `FormField`, `EmptyState`, `BookingProgressProps`, `CopyPaymentValueProps`.

## Phase Index

1. [Foundation: fonts, tokens, editorial CSS, motion primitives](./phase-01-foundation-editorial-primitives.md)
2. [Generated imagery: room + brand photo set](./phase-02-generated-imagery.md)
3. [Public discovery: magazine index, cover story, spec sheet](./phase-03-public-discovery.md)
4. [Booking, payment, confirmation: studio ticket](./phase-04-booking-ticket.md)
5. [Auth and account: brand split, ticket rail](./phase-05-auth-account.md)
6. [Admin: refined density](./phase-06-admin-refinement.md)
7. [Cross-page QA and polish](./phase-07-qa-polish.md)

Phases run in order. Do not parallelize edits to shared CSS or `src/components/ui/*`.

## Plan Status

**Status:** In progress — Phases 1–6 CLOSED (see `.superpowers/sdd/progress.md`). Phase 7: final-branch-review Critical/Important fixes landed (`plans/reports/fixes-260727-0005-GH-26-final-review-fixes.md`) and automated gates (`pnpm ci:verify`, `pnpm build`, full Playwright) verified green; the manual visual/responsive sweep, interaction/a11y sweep, and performance spot checks in `phase-07-qa-polish.md` Tasks 2–4 were not run and remain open. Not "Complete" until those are closed or explicitly re-scoped.

**Supersedes:** remaining unchecked work in `plans/260715-0031-cozy-dark-ui-system/` (phase-03 items 16–25, phases 04–06). Do not execute that plan further; its unfinished restyle scope is absorbed by phases 4–6 here.

## Completion Gate

- Every checkbox in all seven phase files complete.
- `pnpm ci:verify` passes; `pnpm build` passes.
- `pnpm test:e2e:critical` passes against seeded PostgreSQL; touched suites (`auth`, `public-catalog`, `guest-booking`, `room-only-payment`, `admin-catalog`, `admin-schedule`, `dashboards`, `guest-claim`) pass.
- Desktop + 375px, keyboard, and reduced-motion checks complete for every page family.
- No route, domain, database, or authorization behavior changed.
