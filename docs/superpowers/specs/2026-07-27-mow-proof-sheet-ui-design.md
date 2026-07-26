# MOW Proof Sheet — UI Design Specification

**Status:** Approved by user 2026-07-27 ("trên claude design thấy đẹp rồi á, triển khai đi") after reviewing 4 full-page mockups on claude.ai/design (project "MowStudio UI System", group "Redesign Proposal").

**Direction:** Darkroom contact-sheet / studio-instrument aesthetic on the warm paper palette.

**Scope:** ALL pages EXCEPT home hero (`/`), `/login`, `/register` — those three keep their current implementation untouched.

**Supersedes:** the page-level treatments of `2026-07-26-editorial-studio-magazine-ui-design.md` for in-scope pages. Foundation (tokens, fonts, primitives), imagery, accessibility bars, and all behavior/logic constraints from that spec carry forward.

**Visual source of truth (authoritative over prose):** `plans/260727-0140-GH-26-proof-sheet-rebuild/mockups/*.html` — studios-index, room-detail, booking-session, admin-console.

## 1. Concept

The product presents itself as a photographer's proof sheet and studio control desk: precise, technical, warm paper. Dense mono annotation clusters separated by generous whitespace. The customer journey reads as frames on a contact sheet; the booking flow reads as a recording session log; admin reads as a control console.

## 2. Design language (see mockups for exact treatment)

- **Palette:** existing warm tokens unchanged (Canvas `#E7E1D8`, Surface `#F7F5EF`, Raised `#FFFDF8`, Text `#1A1B18`, muted `#57534E`, Action `#254238`). NEW token `--color-record: #B8371F` — used ONLY for live/active/selected indicators (REC dot, active step, selected slot ring); never for text blocks or large fills; max 1–2 instances visible per view.
- **Type roles:** Fraunces = page titles only (tight, large). IBM Plex Mono = all annotational text: labels, numbers, meta, buttons, nav, table data. Plus Jakarta Sans = body paragraphs only.
- **Signature devices:**
  1. Visible column grid — 1px hairlines (`--color-border`) running between layout columns on ≥1024px.
  2. Crop marks — L-shaped corner marks hugging every image frame.
  3. Mono annotations — "FRAME 01 — PHOTO STUDIO — 45M²" style strips above/below frames.
  4. Folio labels — corner labels "MOW · PROOF 01/03" per page.
  5. Film-strip rails — thumbnail rows with sprocket-hole dots.
  6. LED status — colored dot + mono label (dot never the only signal).
  7. Ghost index numbers — oversized low-opacity mono numerals behind content.
- **Motion:** restrained. Keep subtle ScrollReveal on public pages; REMOVE marquee and parallax usage everywhere (components may remain in the codebase unused by pages). Admin: micro-interactions ≤220ms only, as before.

## 3. Page mapping

- `/studios` → contact sheet (mockup 1): 3 room frames + annotations + ghost indexes + film-strip of details.
- `/studios/[slug]` → proof frame (mockup 2): hero frame with crop marks, spec block styled like lens data, services as numbered log rows, CTA with REC dot.
- `/services/[slug]` → extrapolate mockup 2's language: spec-block rate card (mono), numbered explainer rows, single Action CTA.
- Booking wizard → session log (mockup 3): numbered log rail 01–05, current step = REC dot + "ĐANG GHI", slot grid mono with Action-filled selection, ticket stub summary with dashed tear.
- Payment → transfer receipt in proof language: countdown as mono timer, QR on Raised frame with crop marks, copy rows mono, LED payment status.
- Confirmation → developed-frame receipt: state as title, booking code as oversized mono, log-row summary.
- `/account/bookings` (+detail) → personal session log: entries as log rows with LED status and room accent; detail page keeps 01/02/03 sectioning restyled to proof language; danger zone unchanged in behavior.
- `/admin/**` → console (mockup 4): dense mono tables with LED dots, exposed column rules, folio "MOW · CONSOLE"; agenda/calendar and catalog forms restyled to console language; existing admin information architecture unchanged.

## 4. Hard constraints (unchanged from previous pass)

- Zero changes to routes, server actions, domain rules, DB, API, authorization, booking state transitions.
- e2e accessible names change only with same-commit spec updates.
- WCAG AA contrast (record-red on Canvas must pass for any text usage — prefer dot-only), ≥44px touch targets, no horizontal overflow at 375px, `prefers-reduced-motion` removes all motion, content never depends on JS reveals.
- Hero (`/`), `/login`, `/register` untouched — including `.auth-split-*` CSS and `hero.css`, which must survive any CSS cleanup.
- Imagery: current user photography kept as-is.

## 5. Technical organization

- New `src/styles/proof-sheet.css` (public + shared devices) and `src/styles/proof-admin.css` (console) replace the page-level blocks of `editorial-pages.css`/`editorial-admin.css`. Blocks that become dead after migration are DELETED in the same wave that removes their last consumer (auth-split and shared primitives that remain in use are kept).
- New primitives in `src/components/ui/`: `crop-frame.tsx` (image wrapper: marks + annotation strip), `film-strip.tsx`, `led-status.tsx`, `folio-label.tsx`, `ghost-index.tsx`. Existing primitives kept: SectionMarker, ScrollReveal, FormField, PageHeading, EmptyState, action variants. Marquee/ParallaxFrame become unused by pages (kept in codebase, tests intact).
- Tests: unit suites stay green; e2e updated in-commit where copy changes; full gates (ci:verify, build, full Playwright) at final wave.

## 6. Delivery

Wave 0 foundation (token, devices CSS, 5 primitives w/ tests) → Wave 1 parallel tracks (public / booking+payment+confirmation / admin) → Wave 2 account + CSS cleanup → Wave 3 gates + reviews + fix wave. Adversarial review per track, reviewer must give exact fixes, max 2 rounds then controller adjudicates.

## Unresolved questions

None.
