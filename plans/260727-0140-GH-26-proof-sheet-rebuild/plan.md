# MOW Proof Sheet Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (wave mode: parallel tracks with strict file ownership). Steps use checkbox syntax.

**Goal:** Rebuild every page except `/`, `/login`, `/register` to the approved MOW Proof Sheet direction (contact-sheet / studio-console aesthetic) per the mockups in `./mockups/`.

**Architecture:** Add a proof-sheet device layer (2 CSS files + 5 primitives), then swap page presentation per mockups in parallel waves with disjoint file ownership. Zero behavior/logic change. Delete superseded editorial page CSS with its last consumer.

**Tech Stack:** unchanged (Next.js 16, React 19, CSS custom properties, Vitest, Playwright).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-27-mow-proof-sheet-ui-design.md`. Mockups in `./mockups/` are authoritative for visual treatment.
- Untouched: `src/features/home/**`, `src/styles/hero.css`, `src/app/page.tsx`, `src/app/login/**`, `src/app/register/**`, `src/features/auth/presentation/**`, `.auth-split-*` CSS blocks, `public/media/**`.
- `--color-record: #B8371F` only for live/active/selected indicators; never large fills; dot never the sole status signal.
- Fraunces titles only; Plex Mono for all annotational text; Jakarta body paragraphs.
- Remove page usage of Marquee/ParallaxFrame (components + their tests stay).
- All prior hard constraints: no logic/API/route changes; e2e names updated in-commit; AA contrast; 44px targets; 375px no overflow; reduced-motion.
- Agents: no `pnpm build`/playwright during parallel waves (controller runs gates); unit+typecheck+lint per task; stage only owned files; retry on index.lock.
- Reviews: adversarial per track; reviewer gives exact fixes; max 2 fix rounds then controller adjudicates.

## Waves & Ownership

### Wave 0 — Foundation (sequential, one agent)
- Modify: `src/styles/tokens.css` (add `--color-record`)
- Create: `src/styles/proof-sheet.css` (grid rules, crop marks, annotations, folio, film-strip, ghost index, LED, log rows, ticket stub) + `src/styles/proof-admin.css` (console shell/table devices) + imports in `src/app/globals.css`
- Create + test: `src/components/ui/crop-frame.tsx`, `film-strip.tsx`, `led-status.tsx`, `folio-label.tsx`, `ghost-index.tsx`
- Interfaces:
```ts
export type CropFrameProps = Readonly<{ children: React.ReactNode; annotation?: string; className?: string }>;
export type FilmStripProps = Readonly<{ items: readonly { src: string; alt: string; href?: string }[]; className?: string }>;
export type LedStatusProps = Readonly<{ tone: "success" | "warning" | "danger" | "record" | "neutral"; label: string }>;
export type FolioLabelProps = Readonly<{ text: string }>;
export type GhostIndexProps = Readonly<{ index: number }>;
```

### Wave 1 — three parallel tracks
- **Track P (public):** `src/app/studios/page.tsx`, `src/app/studios/[slug]/page.tsx`, `src/app/services/[slug]/page.tsx`, `room-card.tsx`, `service-card.tsx`, `room-visual.tsx` (compose inside CropFrame only), public blocks of `proof-sheet.css`. Tests: room-card/service-card/room-visual tests, `public-catalog.spec.ts`.
- **Track B (booking):** `booking-progress.tsx` (session-log rail), `booking-wizard.tsx`, `booking-summary.tsx`, `vietqr-payment.tsx`, `payment-status.tsx` (LedStatus), booking/payment/confirmation route pages, booking blocks of `proof-sheet.css`. Tests: booking unit tests, `guest-booking.spec.ts`, `room-only-payment.spec.ts`, `assisted-lifecycle.spec.ts` names.
- **Track C (admin console):** `admin-shell.tsx`, `booking-list.tsx` (admin table part only), `booking-calendar.tsx`, `booking-status-badge.tsx` (LED restyle, keep labels), `schedule-editor.tsx`, all `src/app/admin/**` pages, `proof-admin.css`. Tests: dashboard unit tests, admin e2e names.

### Wave 2 — account + cleanup (sequential, one agent)
- `src/app/account/**`, `booking-detail.tsx`, `booking-filters.tsx`, `claim-bookings-banner.tsx` (strip stays, proof language), customer rail in `booking-list.tsx`.
- Then CSS cleanup: delete now-dead blocks of `editorial-pages.css`/`editorial-admin.css`/`editorial.css` (grep-verify zero consumers before each deletion; KEEP `.auth-split-*`, `.display-*`, `.section-marker*`, `.scroll-reveal`, tokens).

### Wave 3 — gates + final review
- Controller: `pnpm ci:verify`, `pnpm build`, full Playwright.
- Visual sweep vs mockups (desktop + 375px + reduced-motion).
- Final whole-branch review (opus) on the rebuild range; ONE combined fix wave; re-verify.

## Completion Gate

All waves reviewed/fixed; ci:verify + build + full e2e green; visual sweep confirms mockup fidelity; hero/login/register byte-identical (git diff empty for their paths); docs journal entry added.
