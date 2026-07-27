# Visual QA Sweep — MOW Proof Sheet Rebuild (GH-26)

Screenshots: `/private/tmp/claude-501/-Users-thanhnguyen-Documents-MowStudio/f1b10250-1f43-48c1-8bed-af5e528ef472/scratchpad/ps-visual/`
Method: `ALLOW_TEST_ACTOR=true pnpm dev` on :3000, Playwright MCP, seeded Supabase data, `mowstudio-test-role` cookie for ADMIN/CUSTOMER. Mockups served via local `python3 -m http.server 4001` from `plans/260727-0140-GH-26-proof-sheet-rebuild/mockups/`.

**Note:** `src/styles/editorial-pages.css` had to be temporarily patched to even boot the server (see Critical #1) and was reverted to its original committed state afterward — no git changes were left behind (`git status`/`git diff` clean, confirmed at end of sweep).

## Critical

1. **Whole site down: CSS parse error in `src/styles/editorial-pages.css:130-133`.** The comment `/* ... proof-room-*/proof-service-*/log-frame/confirmation-*/ payment-ledger ... */` contains literal `*/` sequences inside the glob-style path names, which close the CSS comment early. The remaining text (`log-frame/confirmation-*/ payment-ledger in proof-sheet.css...`) becomes invalid CSS, and since this file is `@import`ed by `globals.css` (used in the root layout), **every single page 500s** at build/dev time ("Parsing CSS source code failed"). This must be fixed before anything else — the whole proof-sheet-rebuild is currently unshippable. Fix: reword the comment so no `*/` substring appears mid-sentence (e.g. "proof-room, proof-service, log-frame, confirmation and payment-ledger classes").

2. **Scroll-reveal animation gets stuck at near-zero opacity when the page is scrolled quickly — hides primary content.** Reproduced on:
   - `/studios` (index): only the "Photo Studio" card renders; "Voice/Podcast Booth" and "Music Studio" cards are invisible (DOM present, laid out, but not painted) under default motion + fast/instant scroll. Screenshot: `studios-375.png` vs `studios-375-reduced-motion.png` (all 3 cards visible with `prefers-reduced-motion: reduce`).
   - `/studios/photo-studio`, `/studios/music-studio` (and presumably `voice-podcast-booth`): the "Dịch vụ tại phòng này" / session-log service list (`.service-row.log-row`) renders as a big blank area below the heading — DOM confirms 2 `<article>` rows exist with `opacity:1`/`visible` computed styles and correct geometry, but they paint at near-invisible contrast until real, slow, incremental scrolling passes over them. Screenshots: `studios-photo-studio-1440.png` / `crop-photostudio-session.png` (blank) vs `debug-service-row-reduced-motion.png` / `debug-service-row-wheel-scroll.png` (fully legible).
   - `/account/bookings`: only 3 of 10 seeded booking rows are visible in both the 1440 and 375 full-page screenshots (`account-bookings-1440.png`, `account-bookings-375.png`); DOM has all 10 `<li>` items.
   - Confirmed workaround: `prefers-reduced-motion: reduce` reliably fixes it; slow, incremental `mouse.wheel` scrolling also fixes it. Fast/instant scroll (`scrollIntoViewIfNeeded`, full-page screenshot auto-scroll, and by extension real mobile "flick" gestures, anchor jumps, keyboard PageDown/End, and browser back-forward scroll restoration) does not reliably trigger whatever IntersectionObserver/CSS-scroll-linked reveal is driving these rows.
   - Impact: real users can very plausibly land on a page where two-thirds of the studio catalog or most of their booking history is invisible. This is the single highest-impact bug found. Needs a fix that guarantees content settles to fully visible regardless of scroll speed/direction, independent of `prefers-reduced-motion`.

## High

3. **Admin section does not match the proof-sheet redesign at all.** `/admin`, `/admin/bookings`, `/admin/bookings/calendar` still render the old sidebar-nav admin layout (`admin-1440.png`, `admin-bookings-1440.png`, `admin-bookings-calendar-1440.png`) — no folio breadcrumb (`/ADMIN/BOOKINGS` · `MOW · CONSOLE`), no stat-tile row (today's total/in-progress/pending/revenue), no background column-rule grid, no red "ĐANG GHI" LED dots, none of the console styling from `mockups/admin-console.html`. Either this phase intentionally excludes admin, or the admin proof-sheet work wasn't actually wired up — worth confirming scope with the plan before sign-off.

## Medium

4. **Missing vertical column-rule grid on desktop `/studios` and `/studios/[slug]`.** The mockups (`mockup-studios-index-1440.png`, `mockup-room-detail-1440.png`) show a faint full-height vertical grid (column rules) behind the whole page — a core "proof sheet" cue. The real pages (`studios-1440.png`, `studios-photo-studio-1440.png`) have none. (Mobile correctly hides them per the ask — nothing to flag there — but the desktop baseline itself seems to be missing them, not just at 375px.)

5. **Hydration mismatch on the booking wizard** (`/booking/[id]`, step 1 contact form): console error "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties" — `style={{caret-color:"transparent"}}` is added client-side to the name/email/phone/note inputs but absent from the SSR markup. Not visually broken in the screenshots taken, but it's a real SSR/CSR divergence worth root-causing (likely a client-only "hide caret during typewriter animation" effect applied without `suppressHydrationWarning` or without matching SSR).

## Low / Observational

6. Header/nav on `/studios`, `/studios/[slug]` doesn't match the mockup's minimal folio-style nav (`STUDIOS / DỊCH VỤ / ĐẶT LỊCH / VỀ MOW` + "3 PHÒNG · ĐANG HOẠT ĐỘNG") — real site keeps the standard shared header (Photo/Podcast/Music, Đăng nhập/Đăng ký). Likely out of scope for this feature (shared layout component), flagging only in case it wasn't a deliberate call.
7. `/login` — confirmed unchanged/editorial, auth-split layout intact at both viewports (`login-1440.png`, `login-375.png`). Bricolage renders "Đăng nhập" bold and big; Vietnamese diacritics (â, ậ, ư) not clipped. Mobile collapses to single column with the brand image hidden and a "Menu" button — reasonable, not broken.
8. Fidelity elsewhere is otherwise strong: crop-mark corner brackets, ghost index numbers (01/02/03), film-strip contact sheet with pagination dots, folio proof labels ("MOW · PROOF 0X/03 — ..."), REC dot on the active booking-wizard step, and console-style LED status dots on admin booking tables (once you're on a page that has them) all present and well-proportioned. No clipped Vietnamese diacritics found anywhere. No horizontal overflow at 375px on any page checked (`document.documentElement.scrollWidth === clientWidth` verified for every 375px screenshot).
9. Booking wizard (`/booking/[id]`) fidelity is good at both viewports and matches `mockups/booking-session.html` reasonably well for its step (form step vs. the mockup's calendar step — different steps of the same wizard, not a discrepancy).

## Pages/viewports captured
- 1440×900: studios, studios/photo-studio, studios/music-studio, services/photo-room-rental, login, account/bookings, admin, admin/bookings, admin/bookings/calendar, admin/rooms, booking wizard, + reduced-motion for studios and booking wizard, + all 4 mockups.
- 375×812: same set (minus mockups) + reduced-motion for studios and booking wizard.

## Unresolved questions
- Is admin explicitly out of scope for GH-26, or pending? (Finding #3)
- Is the missing desktop column-rule grid (#4) intentional simplification or a regression?
- Root cause of the scroll-reveal opacity bug (#2) — which component/CSS is responsible (looks like `.log-row`/`.service-row`/room-card reveal-on-scroll treatment shared across `/studios`, `/studios/[slug]`, `/account/bookings`)?
