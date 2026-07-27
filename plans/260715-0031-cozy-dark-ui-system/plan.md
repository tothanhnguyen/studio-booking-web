# MowStudio Cozy Dark UI System Implementation Plan

> **Superseded 2026-07-26** by `plans/260726-1736-editorial-studio-magazine-ui/` (phases 3–6 scope absorbed). Do not execute this plan further.

> **Direction changed 2026-07-19:** The user-approved warm-light theme supersedes this document's dark-only palette constraints for all non-home routes. Preserve existing layouts, component architecture, accessibility requirements, business behavior, and media strategy; source colors from `src/styles/tokens.css` (Canvas `#E7E1D8`, Surface `#F7F5EF`, Raised `#FFFDF8`, Text `#1A1B18`, Action `#254238`). Legacy Void/Ink/Espresso names are compatibility aliases, not dark-color requirements. Images are intentionally unchanged in this pass.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing hero's cozy, dark, minimal visual language across every public, booking, account, and admin page without changing routes or business behavior.

**Architecture:** Add a small CSS-token and presentation-primitive foundation, then migrate one page family at a time. Existing feature boundaries remain authoritative; public pages stay image-led, transactional pages gain a focused shell, and admin pages use a denser warm-dark shell. Each phase is independently testable and preserves server-side domain logic.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, CSS custom properties, `next/font`, Vitest, Testing Library, Playwright.

## Global Constraints

- Every page must remain cozy, dark, and minimal; admin must not switch to a light, cool, neon, or glass-dashboard theme.
- Preserve `#070807` as the page background, with warm Ink, Espresso, Bone, Brass, and Champagne tokens from the approved spec.
- Use Plus Jakarta Sans for display/body and IBM Plex Mono for booking codes, price, time, status metadata, and operational labels.
- Preserve all route URLs, server actions, domain rules, database schema, API contracts, authorization, and booking state transitions.
- Reuse the current hero frame sequence as the source for room visuals; do not add CMS or database media fields.
- Touch targets must be at least 44px, text/control contrast must meet WCAG AA, and keyboard focus must remain visible.
- Support 375px without horizontal overflow and respect `prefers-reduced-motion`.
- Keep focused source files below 200 lines where practical; split by responsibility, not by arbitrary technical layer.
- Use TDD for stateful components and preserve existing accessible names unless tests and product copy are updated together.
- Complete desktop and mobile for each phase before starting the next phase.
- Execution override from the user: agents must not commit or push. Treat every phase-file `git commit` step as a handoff boundary only; report the intended commit message and leave all changes in the working tree for the user to commit.

---

## Source of Truth

- Approved design: `docs/superpowers/specs/2026-07-15-mowstudio-ui-system-design.md`
- Existing hero implementation: `src/features/home/presentation/*`
- Existing product behavior: `docs/superpowers/specs/2026-07-03-mowstudio-design.md`
- Testing guidance: `docs/development/testing.md`

## Plan Status

**Status:** In progress on `tnguyen/phase7.2`

**Blocked by:** None. The hero plan file is unchecked, but commit `3457ca3` and the current code already provide the required visual source.

## File Map

### Shared foundation

- `src/app/layout.tsx`: register fonts and global font variables.
- `src/app/globals.css`: CSS entrypoint only.
- `src/styles/tokens.css`: palette, type, radius, spacing, and motion tokens.
- `src/styles/base.css`: document, focus, reduced-motion, and default typography.
- `src/styles/shell.css`: public, transaction, account, and admin shells.
- `src/styles/hero.css`: existing hero rules moved without visual change.
- `src/styles/forms.css`: fields, validation, and form layout.
- `src/styles/utilities.css`: actions, surfaces, headings, facts rails, and status utilities.
- `src/components/ui/action.ts`: shared action-class contract.
- `src/components/ui/page-heading.tsx`: repeated page heading structure.
- `src/components/ui/form-field.tsx`: field label, hint, and error wrapper.
- `src/components/ui/empty-state.tsx`: consistent empty-state structure.
- `src/components/site-footer.tsx`: internal-page footer.
- `src/components/app-shell.tsx`: responsive global navigation and footer composition.

### Public discovery

- `public/media/rooms/*.webp`: three room-specific crops derived from frame 0032.
- `src/features/studio-room/presentation/room-visual.tsx`: slug-to-asset/material mapping.
- `src/features/studio-room/presentation/room-card.tsx`: room-atlas row.
- `src/features/service/presentation/service-card.tsx`: horizontal service row.
- `src/app/studios/page.tsx`, `src/app/studios/[slug]/page.tsx`, `src/app/services/[slug]/page.tsx`: public page compositions.

### Booking and payment

- `src/app/booking/layout.tsx`: focused transaction shell marker.
- `src/features/booking/presentation/booking-progress.tsx`: progress rail.
- `src/features/booking/presentation/booking-wizard.tsx`: state orchestration and step panels.
- `src/features/booking/presentation/booking-summary.tsx`: shared transaction summary.
- `src/features/payment/presentation/copy-payment-value.tsx`: clipboard interaction.
- `src/features/payment/presentation/vietqr-payment.tsx`, `payment-status.tsx`: payment presentation.
- Booking/payment route pages: layout and hierarchy only.

### Auth and account

- `src/features/auth/presentation/auth-shell.tsx`: split auth composition.
- `src/features/auth/presentation/auth-form.tsx`, `claim-bookings-banner.tsx`: shared form/action styling.
- `src/features/dashboard/presentation/customer-booking-timeline.tsx`: customer history rail.
- `src/features/dashboard/presentation/booking-detail.tsx`, `booking-filters.tsx`: customer detail/filter composition.
- Login, register, and account route pages: headings and shell composition.

### Admin

- `src/features/dashboard/presentation/admin-nav.tsx`: active route navigation.
- `src/features/dashboard/presentation/admin-shell.tsx`: warm dark admin grid.
- `src/features/dashboard/presentation/booking-list.tsx`, `booking-calendar.tsx`, `booking-status-badge.tsx`: compact operational views.
- Room, service, schedule, payment, booking, and blocked-slot pages/components: presentation migration only.

## Stable Interfaces

These names and signatures are shared across phase files and must not drift:

```ts
export type ActionVariant = "primary" | "secondary" | "tertiary" | "danger";
export function actionClassName(variant?: ActionVariant, compact?: boolean): string;

export type PageHeadingProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  headingId?: string;
  size?: "default" | "large";
}>;

export type FormFieldProps = Readonly<{
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}>;

export type RoomMaterial = "photo" | "podcast" | "music";
export type RoomVisualProps = Readonly<{
  slug: string;
  alt: string;
  priority?: boolean;
  className?: string;
}>;

export type BookingProgressProps = Readonly<{
  currentStep: number;
  steps: readonly string[];
}>;

export type CopyPaymentValueProps = Readonly<{
  label: string;
  value: string;
}>;
```

## Phase Index

1. [Foundation and shared shell](./phase-01-foundation.md)
2. [Public discovery](./phase-02-public-discovery.md)
3. [Booking and payment](./phase-03-booking-payment.md)
4. [Authentication and customer account](./phase-04-auth-account.md)
5. [Admin operations](./phase-05-admin.md)
6. [Cross-page QA and polish](./phase-06-qa-polish.md)

Each phase depends on the previous phase. Do not parallelize changes to shared CSS, `AppShell`, or dashboard presentation components.

## Completion Gate

The implementation is complete only when:

- Every checkbox in all six phase files is complete.
- `pnpm ci:verify` passes.
- `pnpm test:integration` passes against PostgreSQL 18.
- `pnpm build` passes.
- Relevant Playwright suites pass against seeded PostgreSQL.
- Desktop, 375px mobile, keyboard, and reduced-motion visual checks are complete.
- No route, domain, database, or authorization behavior has changed.
