# MowStudio Editorial Studio Magazine — UI Design Specification

**Status:** Approved by user 2026-07-26 (concept, scope, motion level, imagery mandate approved in conversation; layout details delegated to implementer)

**Date:** 2026-07-26

**Direction:** Editorial Studio Magazine on the approved warm-light theme

**Scope:** All pages except the completed home hero composition

**Supersedes:** The remaining unexecuted portions of `2026-07-15-mowstudio-ui-system-design.md` (phases 3–6 of plan `260715-0031-cozy-dark-ui-system`). Foundation and public-discovery work already shipped from that plan is kept and upgraded in place, not reverted.

## 1. Purpose

Raise the visual quality of every MowStudio page from "clean and consistent" to "distinctive and desirable" — a high-end printed studio magazine brought to the web. The warm-light theme stays; the upgrade comes from editorial typography, asymmetric layouts, a coordinated bold-motion system, and a newly generated, consistently graded photo set for the rooms.

## 2. Decisions already made with the user

- Keep the warm-light palette from `src/styles/tokens.css` (Canvas `#E7E1D8`, Surface `#F7F5EF`, Raised `#FFFDF8`, Text `#1A1B18`, Action `#254238`). No return to the dark theme.
- Concept: **Editorial Studio Magazine** (chosen over Gallery/Exhibition and Analog Studio Craft).
- Motion level: **bold** — parallax, scroll reveals, marquee, section markers, directional step transitions. Admin is exempt from bold motion.
- Scope: all pages including admin. Home hero scroll-video composition and its 96-frame sequence are kept unchanged (assessed 2026-07-26: render quality is good; frame-perfect regeneration via AI is high-risk, low-benefit).
- New imagery for non-home pages is AI-generated and edited by the implementer; the goal is aesthetic quality and grade consistency with the existing hero poster.
- Layout details are delegated to the implementer; only genuinely important decisions go back to the user.

## 3. Foundation upgrades

### 3.1 Typography

- **Display:** Fraunces (variable, `next/font`, Vietnamese subset) for editorial headlines, room names, section numbers, and pull-quotes. High optical size, tight tracking.
- **Body/UI:** Plus Jakarta Sans (existing).
- **Utility/data:** IBM Plex Mono (existing) for booking codes, prices, times, status metadata.
- New clamp-based display scale, roughly `clamp(2.5rem, 8vw, 7.5rem)` at the top end. Headline line-height near 0.95–1.05.
- Uppercase + wide tracking stays reserved for short eyebrows and utility labels.

### 3.2 Tokens and texture

- Extend `src/styles/tokens.css` with: display font variable, display type scale steps, marquee/reveal motion durations, and a paper-grain noise token (inline SVG/data-URI, opacity ≤ 4%, applied to page background only).
- Room material accents stay: Photo warm ivory, Podcast soft graphite, Music muted sage.

### 3.3 Motion primitives (new, shared)

- `scroll-reveal`: IntersectionObserver-driven enter transitions (opacity + ≤24px translate). One shared hook/utility, not per-page copies.
- `parallax` on images: transform-only, small amplitude, `will-change` scoped, disabled below 768px if jank appears.
- `marquee`: continuous horizontal strip of studio vocabulary; pausable, hidden from screen readers (`aria-hidden`), duplicated content technique.
- Section markers: mono "01 —" index numbers with hairline rules.
- All motion fully removed under `prefers-reduced-motion` (content must remain visible without JS-triggered reveals).

## 4. Generated imagery

Produced with the `ai-multimodal` skill (Nano Banana/Imagen), edited/graded with `imagemagick`.

- Per room (3 rooms): 1 wide hero shot (≥1920w) + 2 detail shots. Art direction: warm film photography, soft natural light, grade matched to Canvas `#E7E1D8` and the hero poster's warm grey stage; each room carries its material accent.
- 1 brand-statement image for login/register.
- Output: `public/media/rooms/*.webp` (and `public/media/brand/*.webp`), optimized; keep total added weight modest (target ≤ 250KB per hero image after webp compression).
- Iterate generation until grade consistency across the set is visually verified side-by-side; discard off-palette results.
- No CMS or database media fields; static assets only.

## 5. Page treatments

### 5.1 `/studios` — magazine index

Numbered oversized room rows (01/02/03) with Fraunces room names at display scale, full-bleed generated images with parallax, alternating asymmetric layout, marquee divider between intro and rows. Hover/focus strengthens the image frame and shifts it slightly.

### 5.2 `/studios/[slug]` — cover story

Full-bleed generated hero image (60–70vh) with the room name in display type overlapping the image edge. Facts rail in mono. Services as editorial feature rows with generated detail imagery. Closing CTA leads to booking.

### 5.3 `/services/[slug]` — spec sheet

7/5 split; left is the editorial description with section markers, right is a sticky "rate card" price panel (mono price/duration/deposit, single primary action). Mobile: price panel directly after the heading.

### 5.4 Booking, payment, confirmation — studio ticket

- Progress rail as one continuous line (active Action fill, completed solid, future hairline).
- Active step framed as a ticket/panel; directional 12–16px step transitions.
- Payment: countdown as primary context, QR on a light Raised surface, mono account/transfer values with copy actions, explicit deposit/total/remaining hierarchy.
- Confirmation: booking state as the main heading, mono booking code, receipt-style summary. Restrained celebration.
- **No changes to booking state logic, server authority, or step order.**

### 5.5 Login/Register — brand split

5/7 split: form beside the generated brand image with a short brand statement and marquee accent. Mobile: single column, wordmark + form. Google auth secondary under an explicit "hoặc" divider.

### 5.6 Account — ticket rail

Booking history as a vertical rail of ticket-style cards (mono date/time/code, status badge, material accent per room). Detail page: two-column desktop, task-priority mobile, danger zone inline at the end.

### 5.7 Admin — refined density, no bold motion

Editorial polish only: mono data columns, section-numbered page headings, compact rows, hairline dividers, refined empty/loading states. Micro-interactions ≤ 220ms. Stays warm-light; no parallax/marquee/reveals.

## 6. Responsive, accessibility, quality bars

- No horizontal overflow at 375px; touch targets ≥ 44px; WCAG AA contrast; visible focus everywhere.
- Status never communicated by color alone; labels stay.
- Reduced motion removes all choreography; content never depends on JS reveals to be visible.
- Existing accessible names used by e2e tests change only together with deliberate test+copy updates.
- Marquee and parallax must not cause layout shift (CLS ≈ 0) or main-thread jank; transform/opacity only.

## 7. Technical organization

- Styles stay split under `src/styles/` (tokens/base/shell/hero/forms/utilities); add `editorial.css` for display type, section markers, marquee, grain if utilities.css would exceed ~200 lines.
- New shared primitives in `src/components/ui/`: `scroll-reveal`, `marquee`, `section-marker`, parallax image wrapper. Kebab-case files, each focused and small.
- Feature presentation stays in its feature module. No route moves, no domain/API/schema changes.

## 8. Verification

- `pnpm ci:verify`, unit tests, production build, relevant Playwright suites against seeded PostgreSQL.
- Update component/e2e tests in the same change whenever visible copy or accessible names change.
- Visual QA: desktop + 375px per page family; keyboard; reduced motion; grade consistency of the generated image set against the hero poster.

## 9. Delivery sequence

1. Foundation: Fraunces, display scale, grain, motion primitives, marquee/section-marker components.
2. Imagery: generate, grade, and optimize the room + brand photo set.
3. Public discovery: /studios, room, service pages.
4. Booking/payment/confirmation ticket pass (absorbs unfinished phase-03 restyle work).
5. Auth + account.
6. Admin refinement.
7. Cross-page QA: responsive, a11y, reduced motion, performance, full test suites.

## 10. Risks

- **Generated-image consistency:** mitigate with one shared art-direction prompt, batch side-by-side review, imagemagick grade pass; regenerate outliers.
- **Motion jank on low-end devices:** transform/opacity only, IntersectionObserver over scroll listeners, disable parallax on small viewports if needed.
- **Fraunces display weight on Vietnamese diacritics at 7rem+:** verify diacritic clearance with real copy early in phase 1; fall back to reduced top-end size if clipping occurs.
- **Test churn:** copy changes batched with their test updates per phase, never deferred to the end.

## 11. Unresolved questions

None.
