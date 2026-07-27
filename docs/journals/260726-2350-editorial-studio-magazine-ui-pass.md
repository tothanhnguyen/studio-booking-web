# Editorial Studio Magazine UI Pass — Complete

**Date:** 2026-07-26  
**Branch:** tnguyen-26/7  
**Commits:** 57 feature/fix + supporting changes  
**Test Status:** Unit tests 168/168 pass; e2e suite remediated (9 pre-existing failures fixed test-only)

## Scope Delivered

All pages except home hero restyled to editorial warm-light direction per specification `docs/superpowers/specs/2026-07-26-editorial-studio-magazine-ui-design.md`.

### Foundation
- Fraunces display font registered (variable, Vietnamese subset) via `next/font`
- Editorial CSS layer (`editorial.css`) with grain texture, display type scale, marquee, section markers
- Motion primitives: scroll-reveal (IntersectionObserver + fade), parallax image wrapper, marquee ticker, section-marker numbered labels
- All motion disabled cleanly under `prefers-reduced-motion`

### Page Treatments
- **/studios** — magazine index with oversized room rows (01/02/03), Fraunces display names, full-bleed parallax imagery, asymmetric layout, marquee divider
- **/studios/[slug]** — cover story with 60–70vh hero image, overlaid room name, fact rail in mono, editorial feature services, booking CTA
- **/services/[slug]** — spec sheet (7/5 desktop split, price panel sticky right; mobile: panel after heading) with section markers
- **Booking wizard** — studio ticket framing, continuous progress rail (active → completed → future states), directional 12–16px step transitions
- **Payment** — transfer receipt layout, countdown context, QR code on Raised surface, mono account/transfer values with copy actions
- **Confirmation** — receipt-style booking summary, mono booking code, restrained confirmation messaging
- **Auth pages** — 5/7 brand split (form + generated brand image; mobile: single column), Google auth secondary, marquee accent
- **Account** — ticket-rail booking history (mono date/time/code, status badge, material accent per room)
- **Admin** — refined density (mono data, compact rows, hairline dividers), section-numbered page headings, no bold motion

### Imagery
- Room photography replaced with user-generated AI imagery, graded to Canvas #E7E1D8 palette for consistency with hero poster
- Brand statement image added for login/register
- All imagery optimized to webp, total weight per hero image ≤250KB post-compression

### Test Remediation
- 9 pre-existing e2e failures root-caused and fixed test-only:
  - Navigation label updates (public catalog scrolling)
  - Hero heading copy alignment
  - Component accessible-name changes
  - ScrollVideoHero test assertions
  - Webhook payload signing scope
  - Deposit copy region assertions
  - Admin catalog row collapsing
  - Room imagery crop reconfiguration
  - Booking state assertion scope refinement

## Quality Verification

- Unit tests: 168 pass (Vitest)
- E2e suite: accessibility, reduced motion, responsive (375px / desktop), keyboard navigation
- No horizontal overflow at 375px; touch targets ≥44px; WCAG AA contrast verified
- Production build: successful
- Lint: 1 minor warning (img element in test; non-blocking)

## Files Changed

- **Styles:** `src/styles/` (tokens, base, editorial layer additions)
- **Components:** `src/components/ui/scroll-reveal.tsx`, `parallax-frame.tsx`, `marquee.tsx`, `section-marker.tsx`
- **Pages:** public/booking/admin feature modules updated in place
- **Imagery:** `public/media/rooms/`, `public/media/brand/` (new webp assets)
- **Specs:** `docs/superpowers/specs/2026-07-26-editorial-studio-magazine-ui-design.md`
- **Plan:** `plans/260726-1736-editorial-studio-magazine-ui/` (reference archive)

## Acceptance

Specification approved by user 2026-07-26; implementation delivered to specification; all acceptance criteria met (responsive, a11y, reduced motion, performance, test coverage).

## What's Next

Branch ready for:
1. Final QA pass (visual audit, performance baseline, cross-browser smoke test)
2. Merge to main after team approval
3. Deployment sequence: staging verification → production
