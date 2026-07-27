# Final Whole-Branch Review — Editorial Studio Magazine UI Pass

**Date:** 2026-07-26
**Range:** `66529c2..f332a72` (42 commits, 75 files, +3523/-824)
**Branch:** `tnguyen/phase7.2`
**Scope:** cross-cutting consistency, deferred-minor triage, Completion Gate audit, security/regression risk
**Pre-verified (not re-run):** `pnpm ci:verify` 168/168, `pnpm build` pass, full Playwright 46 pass / 4 skip / 0 fail

## Verdict

**FIXES-REQUIRED** — 2 Critical, 9 Important, 21 Minor.

Nothing here is a security vulnerability, and no route, domain, database, or authorization behavior changed (independently confirmed — see §4). The blockers are two defects that slipped between task boundaries and were invisible to every per-task review and to the entire e2e suite, plus a Completion Gate that is formally unmet.

---

## 1. Critical

### C1 — Admin booking detail renders scroll-reveal choreography (Global Constraint violation)

`src/features/dashboard/presentation/booking-detail.tsx:32, 60, 74, 103`

`plan.md:19` — *"Admin gets no parallax/marquee/scroll-reveal; micro-interactions ≤ 220ms only."*
Spec §5.7 — *"Stays warm-light; no parallax/marquee/reveals."*

`BookingDetail` wraps all four sections in `<ScrollReveal>` **unconditionally**. The `variant="admin"` prop added in Wave2 (commit `e855048`) only switches `sectionClassName` and suppresses `SectionMarker`s — it never touches the reveals. `src/app/admin/bookings/[id]/page.tsx:31` renders `<BookingDetail variant="admin" />`, so the admin booking detail page ships with staggered 600ms opacity+translate reveals at 0/60/80ms delays.

This is the textbook cross-task-boundary miss: P5.3 built the account detail with reveals; the Wave2 B-fix added the admin variant for *sectioning* only. Neither review had both halves in view.

`BookingList` is clean — its `ScrollReveal` (`booking-list.tsx:73`) is inside `CustomerBookingRail`, not the admin `.admin-row-list` branch.

**Fix** — gate the wrapper on the variant:

```tsx
// booking-detail.tsx, after line 27
const Reveal = isAdmin
  ? ({ children }: { children: ReactNode; delayMs?: number }) => <>{children}</>
  : ScrollReveal;
```

then replace the four `<ScrollReveal …>` with `<Reveal …>`. Add a unit assertion that `variant="admin"` renders no `.scroll-reveal` node.

Secondary defect in the same file: `booking-detail.tsx:104` hardcodes `className="account-detail-section"` instead of `sectionClassName`. Currently masked because the block is inside `{!isAdmin && …}`, but it will draw a double hairline the moment the policy section is enabled for admin. Use `sectionClassName`.

### C2 — Unscoped `.booking-summary` tear-line breaks the summary card on `/booking/[id]/payment`

`src/styles/editorial-pages.css:358-372`

```css
.booking-summary {                       /* unscoped */
  border-block-start: 1px dashed var(--color-border);
  padding-block-start: clamp(1.25rem, 3vw, 2rem);
}
@media (min-width: 901px) {
  .booking-summary {
    border-block-start: 0;
    border-inline-start: 1px dashed var(--color-border);
    padding-block-start: 0;
    padding-inline-start: clamp(1.25rem, 3vw, 2rem);
  }
}
```

`BookingSummary` renders as `className="booking-summary ui-surface"` (`src/features/booking/presentation/booking-summary.tsx:8`). `.ui-surface` (`utilities.css:90`) sets `border: 1px solid`. Both selectors are specificity `(0,1,0)`, and `globals.css` imports `editorial-pages.css` (line 9) **after** `utilities.css` (line 6) — so `.booking-summary` wins.

`src/app/booking/[id]/payment/page.tsx:49` renders `<BookingSummary>` **outside** `.confirmation-receipt`. Result at ≥901px on the payment page: a bordered card with **no top border**, a **dashed left border**, solid right/bottom borders, and **zero top padding**. Below 901px the top border silently becomes dashed.

The rules are also redundant — `editorial-pages.css:386-409` already re-declares the identical tear-line correctly scoped to `.confirmation-receipt > .booking-summary`, added by the `403551b` fix without removing the unscoped original.

Four review rounds on P4.4 and all 46 e2e specs missed it because the payment page's own tests never assert card chrome.

**Fix** — delete `editorial-pages.css:358-372` entirely. The scoped block at 386-409 fully covers the confirmation-receipt behavior (both breakpoints), and deleting restores `.ui-surface`'s intended card chrome on the payment page.

---

## 2. Important

### I1 — `--color-text-subtle` fails WCAG AA on the Canvas background

Spec §6 / `plan.md:20` mandate WCAG AA.

`--color-text-subtle` = `#756f67` (relative luminance 0.1613) on Canvas `#e7e1d8` (0.7581) = **3.82:1**, below the 4.5:1 required for normal-size text. It passes on Surface (4.56:1) and Raised (4.85:1), so the token is only unsafe on the page background — and this branch introduced three such usages:

| Site | Element | Background |
|---|---|---|
| `src/styles/editorial.css:134` | `.studio-index-row__meta` (room meta on `/studios`) | `.studios-atlas` sets no background (`utilities.css:140`) → body Canvas |
| `src/styles/editorial-pages.css:18` | `.auth-split-wordmark` ("MOW STUDIO") | `.auth-split` sets no background → body Canvas |
| `src/styles/editorial.css:64` | `.marquee-track > span` | `.marquee` sets no background → body Canvas |

Pre-existing usages are all on Surface/Raised and remain compliant (`admin-nav-eyebrow`, `admin-blocked-reason`, `account-ticket-code`).

**Fix** — swap those three to `var(--color-text-muted)` (`#57534e`, **5.87:1** on Canvas). The marquee is `aria-hidden` and arguably incidental under WCAG 1.4.3, but it is visible text at 0.875rem; fix it with the other two rather than argue the exemption.

### I2 — New interactive elements below the 44px touch-target floor

Spec §6 / `plan.md:20` require ≥44px. The branch applies this correctly in some places (`admin-nav-link` `min-height: 2.75rem`, `admin-nav-mobile-select` `min-height: 44px`, `.ui-action` `2.75rem`, `.ui-field input` `3rem`) and misses it in others — an internal inconsistency, not an unknown rule:

| Element | File:line | Approx. height | Role |
|---|---|---|---|
| `.admin-text-action` | `editorial-admin.css:390-402` | ~28px (`padding: .25rem .125rem`, 0.8125rem font) | delete affordance on blocked slots |
| `.account-detail-danger-action` | `editorial-pages.css:830-841` | ~40px (`padding: .5rem 0`, `justify-self: start`) | **cancel booking** |
| `.admin-catalog-summary` | `forms.css:135-143` | ~24px (no padding, no min-height) | sole expand affordance for admin room/service rows |
| `.account-filters-select` | `editorial-pages.css:568-575` | ~41px (`padding: .625rem`) | mobile status filter |

Note the unit drift too: `2.75rem` vs `44px` for the same intent.

**Fix** — add `min-height: 2.75rem` (and `align-items: center` where the element is not already flex) to all four. Standardize on `2.75rem`; change `editorial-admin.css:115` from `44px` to `2.75rem` for consistency.

### I3 — Catch-all form error removed → silent submit failure on admin catalog forms

`src/features/service/presentation/service-form.tsx:132`, `src/features/studio-room/presentation/room-form.tsx:79`

Removed in this branch:

```tsx
{Object.values(errors)[0]?.message && <p role="alert" className="text-sm text-[var(--color-danger)]">{String(Object.values(errors)[0]?.message)}</p>}
```

Per-field errors now render only through `<FormField error={…}>`. But the hidden `register("id")`, `register("currency")`, and `register("timezone")` inputs have **no** `FormField` wrapper. If `serviceInputSchema` / `roomInputSchema` rejects one of them, `handleSubmit` blocks the submit handler and **nothing is displayed** — the Save button appears dead. Previously the operator saw the message.

Likelihood is low (those fields are constants) but it is a new silent-failure mode on an admin write path.

**Fix** — restore a residual summary for unmapped errors, before the `{result && …}` block:

```tsx
{(errors.id || errors.currency) && (
  <p className="ui-field__error" role="alert">{String((errors.id ?? errors.currency)?.message)}</p>
)}
```

(use `errors.timezone` for `room-form.tsx`).

### I4 — Unlabeled deposit column on `/admin/bookings` reads as the booking total

`src/features/dashboard/presentation/booking-list.tsx:43-45`

New column renders `{amountFormatter.format(booking.depositAmount)} {booking.currency}`. The admin list previously showed no monetary value at all. `.admin-row--booking` (`editorial-admin.css:177-181`) is a bare grid with **no header row and no `::before` label**, so an operator scanning `/admin/bookings` or the new `/admin` overview list sees an unlabeled figure that is the 30% deposit, not the booking value. Off by 70% on an operational surface.

**Fix** — label it: `<span className="sr-only">Tiền cọc </span>` inside the cell, or add a visible mono column-header row to `.admin-row--booking`. If the total was intended, render `subtotalAmount`.

### I5 — Marquee loop point is off by half the gap (visible stutter every cycle)

`src/styles/editorial.css:56-74`

`.marquee-track` is `display: inline-flex; gap: 2.5rem` with two duplicated `<span>`s, each also carrying `padding-inline-end: 2.5rem`. The keyframe animates to `translateX(-50%)`.

Track width `W = 2s + 2.5rem` (where `s` = one span's border box). `50% of W = s + 1.25rem`, but the second copy's left edge is at `s + 2.5rem`. The seam is **1.25rem (20px) short**, so the strip visibly jumps every 28s. Applies to the only marquee on the site (`/studios`).

**Fix** — `.marquee-track { gap: 0; }`. Spacing is already fully supplied by each span's `padding-inline-end: 2.5rem`, which also removes the current double-spacing between copies.

### I6 — Spec §5.5 marquee accent missing from the auth pages

Spec §5.5 (line 83): *"5/7 split: form beside the generated brand image with a short brand statement **and marquee accent**."*

`src/features/auth/presentation/auth-shell.tsx` renders a `SectionMarker` (line 41) but no `<Marquee>`. `grep '<Marquee'` finds exactly one production call site: `src/app/studios/page.tsx:35`. The P5.1 review is recorded in the ledger as "10/10 spec approved" despite the gap.

**Fix** — add `<Marquee items={[…]} />` inside `.auth-split-brand-overlay` (or as a hairline strip under the form column), or record an explicit approved deviation in the spec.

### I7 — Room hero images are 960px wide; spec §4 requires ≥1920w

Spec §4 (line 53): *"Per room (3 rooms): 1 wide hero shot (**≥1920w**) + 2 detail shots."*

Measured:

```
photo-studio.webp          960x864   56K
voice-podcast-booth.webp   960x720   64K
music-studio.webp          960x840  148K
auth-statement.webp       1280x1031  56K
hero-capsules-poster.webp 1440x1080  40K   (reference)
```

All three room heroes are half the specified width. They are used full-bleed at 60–70vh on `/studios/[slug]` (`.room-story-hero-visual` `min-block-size: clamp(24rem, 65vh, 44rem)`), so a 960px source will be upscaled on any desktop and heavily so at 2× DPR.

Root cause is legitimate and recorded — the image-generation quota block (ledger line 13) forced derivation from `hero-theme.mp4` (1080p), capping usable width. But the ledger records it as a note, not as an approved spec amendment.

File weights are all within budget (heroes ≤250KB, details ≤150KB), so §4's weight target passes.

**Fix** — either upscale/re-derive at ≥1920w, or amend spec §4 with the accepted 960w constraint and its rationale so the gate is honestly closed.

### I8 — Completion Gate is formally unmet, and its a11y/responsive bars have no automated enforcement

`plan.md:131` — *"Every checkbox in all seven phase files complete."* Actual state:

```
phase-01  done=0  open=28      phase-05  done=0  open=18
phase-02  done=0  open=15      phase-06  done=0  open=19
phase-03  done=0  open=22      phase-07  done=0  open=19
phase-04  done=0  open=21
```

**0 of 142 checkboxes are ticked.** Completion tracking migrated to `.superpowers/sdd/progress.md`, which is fine as a working practice, but the gate names the phase files.

`plan.md:134` — *"Desktop + 375px, keyboard, and reduced-motion checks complete for every page family."* Phase-07 is entirely open, and the ledger's last line reads "Wave3 QA starting". These specific bars are open:

- 375px overflow sweep across all routes (phase-07:17-18)
- keyboard-only pass, visible focus, no trap (phase-07:24)
- reduced-motion `emulateMedia` pass (phase-07:25)
- AA contrast spot-check (phase-07:26) — **would have caught I1**
- touch targets ≥44px at 375px (phase-07:27) — **would have caught I2**
- CLS/LCP/long-task trace (phase-07:31)
- docs sync: `development-roadmap.md`, `project-changelog.md`, supersession note (phase-07:37-38)

Nor is any of it enforced by tests. Grepping `tests/` for `375`, `setViewportSize`, `reducedMotion`, `axe` returns **one** hit: `tests/e2e/home-hero.spec.ts:108` — a page explicitly out of scope for this branch.

**Fix** — run phase-07 before merge, and land at least one automated guard per bar (a 375px viewport project in `playwright.config.ts` and an `emulateMedia({ reducedMotion: 'reduce' })` spec over the six restyled page families) so these cannot regress silently.

### I9 — Raw status enums shown to customers beside the newly-translated labels

`src/features/payment/presentation/payment-status.tsx:40, 44` and `src/features/dashboard/presentation/booking-detail.tsx:92, 96`

This branch added `paymentStatusBadgeLabel` (`payment-status.tsx:12-17`) and renders a Vietnamese badge — then leaves the `<dl>` immediately below it printing the raw enum:

```tsx
<dt>Trạng thái booking:</dt><dd className="type-mono">{bookingStatus}</dd>       // "PENDING_PAYMENT"
<dt>Trạng thái thanh toán:</dt><dd className="type-mono">{paymentStatus}</dd>    // "PAID"
```

So `/booking/[id]/payment` now shows "Đã thanh toán" and "PAID" one line apart. `/account/bookings/[id]` has the same pattern for `paymentStatus` / `refundStatus`. `getBookingStatusLabel` already exists in `booking-status-badge.tsx:28`.

Spec §6 is satisfied literally (status is not color-only), but the branch half-localized a customer-facing surface and left the machine value beside it.

**Fix** — render `getBookingStatusLabel(bookingStatus)` and `paymentStatusBadgeLabel[paymentStatus]` in the `<dl>`, or drop the now-redundant rows. **Requires a test update in the same change**: `tests/e2e/room-only-payment.spec.ts` asserts `getByText("PENDING", { exact: true })` (`plan.md:21` — accessible-name changes ship with their test).

---

## 3. Minor

### Style-layer organization and naming drift

- **M1** `editorial.css` is declared the foundation layer (`plan.md:31`: "display type, grain, section marker, marquee, reveal, parallax rules") but carries two page families' styles: `.studio-index-*` (lines 91-163) and `.booking-rail*` (178-277). Every other family lives in `editorial-pages.css`. *Fix:* move both blocks to `editorial-pages.css`.
- **M2** Three class-naming conventions in one branch: BEM `__`/`--` in `editorial.css` (`.studio-index-row__visual`, `.booking-rail__step`), flat kebab in `editorial-pages.css` (`.room-story-service-visual`, `.account-detail-header-identity`), mixed in `editorial-admin.css` (flat kebab + `.admin-nav-link--active`). *Fix:* pick flat kebab (the majority) and note it at the top of `editorial.css`.
- **M3** Admin markup uses `account-`prefixed classes: `booking-detail.tsx` renders `.account-detail-sections/-content/-meta/-fields/-subheading` on `/admin/bookings/[id]`, contradicting `editorial-admin.css:1` ("Prefix: `.admin-`"). *Fix:* rename the shared block to a neutral `.booking-detail-*`, or document the sharing at both files' headers.
- **M8** Admin catalog form styles live in `forms.css:110-151` with an `.admin-` prefix rather than in `editorial-admin.css`. *Fix:* move the block.

### Token vocabulary split

- **M4** `tokens.css:21-30` keeps ten legacy aliases (`--color-smoke`, `-bone`, `-warm-line`, `-espresso`, `-brass`, `-champagne`, `-sage`, `-clay`, `-void`, `-ink`). The `account-*` block in `editorial-pages.css` (521-843) is written **entirely** in legacy aliases while every other new block in the same file (`auth-split`, `room-story`, `service-sheet`, `payment-*`, `confirmation-*`) uses canonical tokens. `editorial-admin.css` is canonical **except** lines 294-295 (`--color-brass` / `--color-sage`). One rule mixes both vocabularies inside a single component: `.account-ticket-code` (line 655) uses `--color-text-subtle` inside an otherwise all-legacy block. *Fix:* the aliases are 1:1 with canonical tokens per `tokens.css:21-30` — mechanically replace in `editorial-pages.css:521-843` and `editorial-admin.css:294-295`, then consider deleting the aliases once `utilities.css`/`shell.css`/`forms.css` follow.
- **M14** `booking-status-badge.tsx:13-18` hardcodes hex values that are exactly existing tokens (`#6e4f16` = `--color-warning`, `#315a66` = `--color-info`, `#2f5d46` = `--color-success`, `#8b3e35` = `--color-danger`, `#57534e` = `--color-text-muted`). The AA verification comment is good; the duplication is not.
- Hardcoded `#f7f5ef` / `rgb(26 27 24 / …)` in `.auth-split-brand-overlay` (`editorial-pages.css:94-103`) instead of `--color-surface` / `--color-text`. Defensible (fixed light-on-image overlay) but should use the tokens.

### Duplicate CSS

- **M5** `.account-bookings` (`editorial-pages.css:503-509`) and `.account-detail` (676-682) are byte-identical. `.account-page-heading .page-heading h1` (511-517) and `.account-detail-heading .page-heading h1` (684-690) are byte-identical **and** re-implement `.display-md` (`editorial.css:3-15`) declaration for declaration. *Fix:* group each pair into one selector list; better, add the two heading selectors to the `.display-xl, .display-lg, .display-md` rule or pass `className="display-md"` through `PageHeading`.
- **M6** `.room-story-hero-frame` sets `will-change: transform` (`editorial-pages.css:134`) and a reduced-motion `transform: none !important` (213-215) — both already provided by `.parallax-frame` (`editorial.css:89, 175`), and the element **is** a `ParallaxFrame` (`src/app/studios/[slug]/page.tsx:44`). *Fix:* delete both.
- **M9** `[data-room-material]::before` accent bar duplicated between `.account-ticket` (`editorial-pages.css:634-645`) and `.admin-agenda-entry` (`editorial-admin.css:284-295`) — the comment at 278 acknowledges the mirror. Both handle only `photo`/`music`, leaving `podcast` to the default; correct per spec §3.2 (graphite) but implicit. *Fix:* extract a shared `[data-room-material]` rule set and add an explicit `="podcast"` selector.
- **M10** `resolveRoomMaterial` duplicated byte-for-byte in `booking-list.tsx:17-22` and `booking-calendar.tsx:20-25`. They agree, so no correctness risk — and `booking-list.tsx:7` already imports `formatStudioDateTime` from `booking-calendar`, so one `export` de-dupes it.
- **M16** `.marquee-track` applies both `gap: 2.5rem` and `padding-inline-end: 2.5rem` per span (double spacing). Resolved by the I5 fix.

### Dead / unreachable

- **M7** `className="room-story-service-row"` (`src/app/studios/[slug]/page.tsx:78`) has no CSS rule anywhere. The intended rules target `.room-story-service .service-row` (`editorial-pages.css:198`). Harmless but a naming leftover. *Fix:* drop the class or style it.
- **M21** `.ui-action--tertiary` (`utilities.css:40`) and `.page-heading--default` (69) are never produced by any call site. Pre-existing, not introduced here.
- Cleanup was otherwise thorough: all 33 classes removed from `utilities.css` (-322 lines) are genuinely orphaned old-design rules with no remaining references.

### Behavior / motion nits

- **M11** `ScrollReveal` (`scroll-reveal.tsx:15-23`) initializes to `"revealed"` (correct for SSR/no-JS) then flips to `"pending"` in `useEffect`, which runs **after** paint. Above-the-fold content therefore paints visible, starts a 600ms fade toward `opacity: 0`, then reverses when the IntersectionObserver callback fires. A 1–2 frame dip in practice. *Fix:* `useLayoutEffect` — it runs before paint, removing the dip while keeping the SSR-visible markup.
- **M12** `.booking-rail` only stacks at `max-width: 375px` (`editorial.css:260`). At 390px (iPhone 12–15) the 5-step wizard rail stays in one row. *Fix:* raise the breakpoint to `max-width: 30rem`.
- **M13** `page-grain` is applied to `/studios`, room, service, account bookings, account detail, and auth — but not to the booking wizard / payment / confirmation family. Spec §3.2 says "page background only" without excluding the transaction pages. *Fix:* apply it there too, or note the deliberate exclusion.
- **M15** The refund form at `src/app/admin/bookings/[id]/page.tsx:96-110` styles its label/select/input with raw Tailwind arbitrary values (`border-[var(--color-control-border)]` …) instead of `.ui-field`/`.admin-*` — the one place the editorial layer was bypassed, and `editorial-admin.css:313` explicitly documents that convention.

### Non-presentational deltas bundled into a UI branch

None are defects; all warrant author confirmation (see §4).

- **M17** Google OAuth button now appears on `/register` (`auth-form.tsx:70`) — it previously lived only in `src/app/login/page.tsx`. No open-redirect risk (`redirectTo` is built from `serverEnv.APP_URL` with a hardcoded `?next=`), but it is a product change.
- **M18** `vietqr-payment.tsx:26` derives `totalAmount = amount + remainingAmount` client-side. Arithmetically exact today (`calculateDeposit` in `src/lib/money/vnd.ts:17` defines `remainingAmount = subtotalAmount - depositAmount` in integer arithmetic, never mutated). Fragile if `remainingAmount` is ever redefined as "balance after payments received". *Fix:* expose `subtotalAmount` on `PaymentView` instead of summing in the view.
- **M19** `/admin` overview now renders `<BookingList>` (`src/app/admin/page.tsx`), newly surfacing customer names and emails on a page that previously showed counts and two links. Behind `getAdminPageActor()`, so not a leak — but new PII on a new page. (Counterbalanced: `/account/bookings` moved to `CustomerBookingRail`, which no longer renders `customerName`/`customerEmail` — strictly less exposure.)
- **M20** `src/app/services/[slug]/page.tsx:26` adds a `listPublicRooms()` query per request (page is `force-dynamic`) purely to resolve one link label. *Fix:* return the room slug/name from `getPublicServiceBySlug`.

---

## 4. Security / regression audit

**No security vulnerability found. The "no route, domain, database, or authorization behavior changed" claim holds.**

`git diff --name-only 66529c2..f332a72` touches **zero** files under `src/lib`, `src/server`, `src/domain`, `src/app/api`, `prisma/`, or middleware (none exists). Every `.ts`/`.tsx` change is under a `presentation/` dir, an `src/app/**/page.tsx`, `src/app/layout.tsx` (font registration only), or the four new `src/components/ui/*` primitives. Added lines scanned for `dangerouslySetInnerHTML`, `process.env`, `innerHTML`, `localStorage`, `document.cookie`, `target="_blank"`, and user-input-derived `href` — zero hits.

**Auth** — clean. `name="email"`/`name="password"`, `type`, `autoComplete` (including the `current-password`/`new-password` mode switch), `required`, `minLength={8}` all preserved. `signInAction`/`signUpAction` call shape, the post-login `router.push("/account/bookings")`, and the `role="status"` vs `role="alert"` split are logic-equivalent. No CSRF/hidden fields existed before or after. No secret rendered into markup. Only delta is M17.

**Payment** — clean. QR payload, `transferContent`, `accountNumber`, `accountName`, and `bankBin` pass through verbatim (`bankBin`/`accountName` merely moved into the pre-existing, unchanged `CopyPaymentValue`). No booking-code truncation on the payment page. `HoldCountdown` / `holdExpiresAt` untouched. `paymentStatusBadgeLabel` covers exactly `PENDING|PAID|FAILED|EXPIRED` — the complete `PaymentStatus` enum in `prisma/schema.prisma:34-39` — so there is no path to showing paid-when-unpaid; the `?? paymentStatus` fallback is unreachable. Only deltas are M18 and the labeling issue I9.

**Admin** — authorization intact. Every `src/app/admin/**/page.tsx` retains its `getAdminPageActor(...)` with the identical `nextPath`; `admin-page-actor.ts` is unchanged. `BookingDetail`'s `showCustomer` gate is preserved exactly — `variant="admin"` never affects which fields render. All four inline server actions on `/admin/bookings/[id]` keep their conditional render gates, `name` attributes, `required` flags, and option sets. `booking-filters.tsx` and `schedule-editor.tsx` preserve every `name`, `required`, and `defaultValue` verbatim. `/admin/payments` newly displays `booking.updatedAt`, which was already in the prisma `select` (used for `orderBy`) — display-only, not a query change. `admin-shell.tsx` became a client component (M6/M19 context), but `AdminLayout` still `await getAdminPageActor()` before rendering it and passes `children` as a server-rendered prop, so no server work leaked and the gate is intact; the nav link set is identical.

**The `<details>` collapse in `f332a72` — verified safe.** `<RoomForm>` / `<ServiceForm>` are rendered **unconditionally** inside `<details>` in both `src/app/admin/rooms/page.tsx` and `src/app/admin/services/page.tsx` — no `{open && …}`, no conditional mount, no field removed from the DOM. The added CSS (`forms.css:135-151`) does no `display:none` toggling of its own. Doubly moot: the submit button is inside the `<details>` too (so submission is only possible while expanded, sidestepping the "invalid required control is not focusable" trap), and the payload never travels as FormData — both forms submit a typed object via `handleSubmit(value => saveRoomAction(value))`, so `name` attributes are not load-bearing. The `register("id")`, `register("currency")`, and `register("timezone")` hidden inputs are intact. The only real regression on these forms is I3.

**Test integrity — no assertion was weakened to paper over a regression.** `admin-catalog.spec.ts` adds `summary` clicks required by the new `<details>`, assertions unchanged. `assisted-lifecycle.spec.ts` moves from raw `"CONFIRMED"` to the localized badge label and narrows a `dd` locator to avoid colliding with the refund `<select>`'s `<option>` — tightened, not loosened. The `evt-e2e-*-${project.name}` → `${bookingId}` change in `room-only-payment.spec.ts` / `assisted-lifecycle.spec.ts` is a genuine webhook-idempotency fix against a persistent DB. `public-catalog.spec.ts` adds `.first()` because the studio page now renders three `room-visual`s.

---

## 5. Deferred-minors triage

| # | Ledger item | Verdict | Evidence |
|---|---|---|---|
| 1 | ScrollReveal `useSyncExternalStore` note / eslint-disable comment style | **fine-to-defer** | `scroll-reveal.tsx:21-23` vs `vietqr-payment.tsx:39` — the only two hand-written disables in `src/`; pure style. Behavior nit tracked as M11. |
| 2 | ParallaxFrame resize across 768px | **fine-to-defer** | Not a leak: `parallax-frame.tsx:19` returns *before* attaching any listener on the small/reduced path; the active path returns full cleanup at 37-40. Worst case is a stale ≤12px inline transform. |
| 3 | RoomVisual unknown-slug + variant, unclamped `data-variant` | **fine-to-defer** | No broken src — `room-visual.tsx:46` gates the suffix on `isKnownRoom`, so unknown+variant yields the plain fallback poster. `data-variant` is inert (no CSS reads `[data-variant]`). Test-coverage gap only. |
| 4 | `-hero-visual` vs `-hero` clamp | **obsolete** | Correctly targeted. `.room-story-hero-visual` lands on the `RoomVisual` `<figure>` (`studios/[slug]/page.tsx:47`), the element carrying `aspect-ratio: 13/12` from `utilities.css:107` — the `aspect-ratio: auto` reset only makes sense there. `.room-story-hero` is the positioning context; `.room-story-hero-frame` is the transform target. |
| 5 | SectionMarker 03 buffer-time copy | **obsolete** (as a code issue) | Real data, not filler — `services/[slug]/page.tsx:86-93` renders `{service.bufferMinutes}` from the DB, mirroring the rate card at 60-62. Copy sign-off remains a design question. |
| 6 | Booking rail pill-vs-circle | **fine-to-defer** | `editorial.css:216-231` — `min-width: 2.5rem; height: 2.5rem; border-radius: 50%`; the wizard has 5 steps (`booking-wizard.tsx:19`), so indices are single-digit and the marker is always a true circle. |
| 7 | `.booking-ticket` duplicates `.ui-surface` | **obsolete** | Already refactored to compose — `editorial-pages.css:332-337` contains only the offset var, `position: relative`, and `animation`; zero overlap with `.ui-surface` (`utilities.css:90-96`). Both call sites apply both classes. |
| 8 | Payment "triple card chrome" | **obsolete as written → surfaced C2** | No triple nesting exists (max chrome depth is 1; `.payment-receipt` is a plain grid, `.payment-qr` has no chrome rules, `.payment-qr__image-frame` is padding-only). Investigating it found the real defect: the unscoped `.booking-summary` tear-line — **C2**. |
| 9 | No component tests for `auth-shell` | **fine-to-defer** | Tests are the norm but not universal (12/30 presentation components have one; `auth/` is 0/3, `availability/` 0/1). `auth-shell.tsx` has zero conditional logic — a test would assert only markup. |
| 10 | `resolveRoomMaterial` duplication | **fine-to-defer** | Exactly 2 copies (`booking-list.tsx:17-22`, `booking-calendar.tsx:20-25`), byte-identical, no divergence. Cheap to fix — see M10. |
| 11 | Admin mobile nav overflow at 375px | **obsolete** | Protected by construction: the mobile nav is a native `<select>` (`admin-shell.tsx:76-95`), not a link row; desktop rail is `display:none` below 768px; `.admin-shell-content { min-width: 0 }` prevents grid blowout. Min-content ≈266px vs ~311px available. |
| 12 | Podcast photos have no mic gear | **fine-to-defer (user question)** | All three files exist (61/65/74 KB) and are wired via `room-visual.tsx:20-23,47`, seeded at `prisma/seed.ts:18`. Image *content* needs a human or vision pass. |

**TODO/FIXME/placeholder sweep across `src/styles/editorial*.css`, `src/features/**/presentation/*.tsx`, `src/app/**/page.tsx`: clean.** Zero `TODO`/`FIXME`/`XXX`/lorem. One `placeholder` hit, a legitimate HTML attribute (`src/app/admin/bookings/[id]/page.tsx:110`).

---

## 6. Recommended merge sequence

**Must fix before merge**

1. C1 — gate `ScrollReveal` on `variant="admin"` in `booking-detail.tsx`; use `sectionClassName` at line 104.
2. C2 — delete `editorial-pages.css:358-372`.
3. I1 — swap three `--color-text-subtle` usages to `--color-text-muted`.
4. I2 — `min-height: 2.75rem` on the four sub-44px controls.
5. I3 — restore the residual error summary in `service-form.tsx` / `room-form.tsx`.
6. I4 — label the deposit column in `booking-list.tsx`.
7. I5 — `.marquee-track { gap: 0 }`.
8. I8 — run phase-07 (or explicitly re-scope the gate), and land the 375px + reduced-motion Playwright guards.

**Decide before merge (needs the author / design owner)**

- I6 — add the auth marquee, or amend spec §5.5.
- I7 — re-derive heroes at ≥1920w, or amend spec §4 with the accepted 960w constraint.
- I9 — localize the status `<dl>` (batch with its e2e update per `plan.md:21`).
- M17 / M19 — confirm the Google-on-`/register` and `/admin`-overview-PII changes are intentional product decisions.

**Cheap DRY wins, safe to batch with the above**

M4 (token vocabulary), M5 (duplicate blocks), M6 (redundant parallax rules), M7 (dead class), M10 (`resolveRoomMaterial` export).

**Fine to defer**

M1–M3, M8, M9, M11–M16, M18, M20, M21, and deferred-minors 1, 2, 3, 6, 9, 12.

---

## Unresolved questions

1. Are M17 (Google on `/register`), I4/M19 (`/admin` overview list with customer emails and a deposit column) deliberate product decisions bundled into this branch, or accidents? They read as intentional.
2. Was the 960w hero derivation (I7) accepted as a permanent spec amendment, or is it a temporary state pending image-generation quota?
3. Should the ten legacy token aliases in `tokens.css:21-30` be retired in this branch or tracked as separate debt? M4's fix is mechanical either way.
4. Do the podcast room photos need to show microphone gear (deferred minor 12)? Requires a human or vision pass on the images.
