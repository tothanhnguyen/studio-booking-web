# Final whole-range review — MOW Proof Sheet rebuild (GH-26)

**Range:** `308d222..a69eba7` (16 commits, 51 files, +2246/−1374)
**Reviewer:** general-purpose (opus), 2026-07-27 02:34
**Spec:** `docs/superpowers/specs/2026-07-27-mow-proof-sheet-ui-design.md`
**Plan:** `plans/260727-0140-GH-26-proof-sheet-rebuild/plan.md`

## Verdict

**FIXES-REQUIRED** — Critical 0 · Important 6 · Minor 13.

No blocking defect: protected paths are byte-clean, no behavior delta, gates re-verified
locally (tsc 0 errors, vitest 188/188, eslint 0 errors / 3 warnings — 1 new). The Important
items are all presentation-layer regressions against the spec's own §4 hard constraints
(44px targets, focus visibility, a11y) plus two spec-completeness gaps. All have small,
mechanical fixes; one combined fix wave clears them.

---

## Gate re-verification (this review)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | pass (0 errors) |
| `npx vitest run` | 62 files / **188 tests passed** |
| `npx eslint src` | 0 errors, 3 warnings (`film-strip.tsx` new — see IMP-6; 2 pre-existing in test files) |
| Protected-path diff | **EMPTY** ✅ |
| Behavior delta | **NONE** ✅ |

### 3. Protected-path audit — PASS

`git diff --stat 308d222..a69eba7 -- src/features/home src/styles/hero.css src/app/page.tsx src/app/login src/app/register`
→ **empty**. `claim-bookings-banner.tsx` untouched (plan Wave 2 listed it as optional; not needed).
No `.auth-split-*` or `hero.css` block was touched by the Wave-2 CSS cleanup.

### 4. Behavior audit — PASS

Full-diff read of all 42 changed `.ts/.tsx` files. Every delta is class renames, JSX
restructuring, or new presentational props. Specifically verified:

- No route, server action, Prisma query, authorization, or booking-state change. The one page
  with a raw query (`src/app/admin/payments/page.tsx`) has an untouched `prisma.booking.findMany`;
  only the row markup and a local presentational `StatusDot` were added.
- `src/app/studios/[slug]/page.tsx:37-40` — `listPublicRooms()` result is now stored and
  `findIndex` derives a display index. Same single call, no new I/O.
- `service-card.tsx` — new required `index` prop and optional `visual` prop; both purely
  presentational, all call sites updated (tsc green).
- `booking-status-badge.tsx` — labels and the exported `getBookingStatusLabel` unchanged; only
  the pill→LED markup swapped.
- `admin-shell.tsx` — nav structure, hrefs, `resolveActiveHref`, and the mobile `<select>`
  router push are all preserved verbatim; only wrapper classes changed.

### 2. Staging-technique spot-check (hash-object/update-index, Tracks P/B) — PASS

Broad bidirectional orphan sweep over the **final tree** (not the diff): every `className`
literal in all `src/**/*.tsx` vs every class selector in all `src/**/*.css`.

- **Used → not defined:** only `led-status__label` (MIN-4) and `proof-room-hero__frame` (MIN-5).
  Everything else unmatched was a Tailwind v4 utility (`sr-only`, `grid`, `text-*`, …; Tailwind
  is active via `@import "tailwindcss"` in `globals.css:1`) or a runtime-composed prefix
  (`ui-action--`, `page-heading--`).
- **Defined → never used:** `proof-grid`/`proof-grid__col` (IMP-5) and 7 orphaned editorial
  blocks (MIN-6). Nothing else. No class was lost by the unusual staging technique — the
  content-hash writes produced a coherent tree.

---

## Important

### IMP-1 — 44px touch-target regression on the `/studios` room CTA
`src/styles/proof-sheet.css:358-371` (+ consumer `src/features/studio-room/presentation/room-card.tsx:88-95`)

`.proof-room-frame__cta` replaced `actionClassName("secondary")` (`.ui-action`,
`min-height: 3rem`, `utilities.css:3`) with an inline underline link: `font-size: 0.75rem`,
`padding-block-end: 0.1875rem` → hit area ≈ **18px tall**. This is the only navigation
affordance per room frame on the contact sheet. Violates spec §4 "≥44px touch targets"
and is a regression introduced by this range.

`.proof-service-room-link` (`proof-sheet.css:576-585`) has the same shape on `/services/[slug]`.

**Fix:**
```css
.proof-room-frame__cta {
  min-block-size: 2.75rem;          /* add */
  padding-block: 0.75rem 0.5rem;    /* replace padding-block-end: 0.1875rem */
  /* keep: inline-flex, align-items: center, align-self: flex-start */
}
.proof-service-room-link {
  display: inline-flex;             /* add */
  align-items: center;              /* add */
  min-block-size: 2.75rem;          /* add */
}
```

### IMP-2 — Primary CTA labels shrink to 11px uppercase mono
`src/app/services/[slug]/page.tsx:71-73`, `src/app/studios/[slug]/page.tsx:103-106`
(device: `src/styles/proof-sheet.css:158-167`)

Both pages render `<LedStatus>` **inside** `<Link className={actionClassName("primary")}>`.
`.led-status` forces `font-size: 0.6875rem`, `font-family: mono`, `letter-spacing: 0.06em`,
`text-transform: uppercase` onto the button's label span, overriding `.ui-action`'s
`font-size: 0.875rem; font-weight: 700` (`utilities.css:12-13`). The main conversion CTA
("ĐẶT LỊCH DỊCH VỤ NÀY") renders ~40% smaller than every other primary button in the product,
in all-caps mono — a legibility and consistency regression, not in any mockup instruction.

**Fix** — add one rule to `proof-sheet.css` (keeps the record dot, restores button typography):
```css
.ui-action .led-status {
  font: inherit;
  letter-spacing: inherit;
  text-transform: none;
}
```

### IMP-3 — Focus indicators clipped for every field in the booking wizard
`src/features/booking/presentation/booking-wizard.tsx:97` + `src/styles/proof-sheet.css:29-32`

`<CropFrame>` now wraps the whole step form. `.crop-frame__body` sets `overflow: hidden` with
**zero inline padding**, while `.ui-field :where(input, select, textarea)` is `width: 100%`
(`forms.css:12-13`). Both focus indicators extend outside that box and are therefore clipped
left/right on every input in the wizard:
- `forms.css:37-40` — `box-shadow: 0 0 0 3px …` on `:focus`
- `base.css:16-19` — global `outline: 2px solid var(--color-focus); outline-offset: 3px`

WCAG 2.4.7 / spec §4 focus-visibility. The crop marks are absolutely positioned and do not
need the clip.

**Fix** — scope the clip to media frames:
```css
.crop-frame__body { position: relative; }                     /* drop overflow: hidden */
.crop-frame__body > :where(img, picture, figure, .room-visual) { overflow: hidden; }
```
Minimal alternative: `.log-frame .crop-frame__body { overflow: visible; }`.

### IMP-4 — Non-descriptive `alt` on the new service thumbnails
`src/features/service/presentation/service-card.tsx:47` (test lock-in at `service-card.test.tsx:46-48`)

```tsx
alt={`Phòng`}
```
Two problems: a template literal with no interpolation, and a meaningless accessible name.
The thumbnail is decorative (the service name and room context sit right next to it), so every
service log row on `/studios/[slug]` announces "Phòng" ("Room"). Introduced by the final fix
commit `4206682`, after the Track-P review.

**Fix** — mark decorative and drop the test assertion:
```tsx
<RoomVisual alt="" className="service-row__thumb-image" slug={visual.slug} variant={visual.variant} />
```
In `service-card.test.tsx`, replace `expect(screen.getByAltText("Phòng")).toBeInTheDocument()`
with `expect(screen.getByTestId("room-visual")).toBeInTheDocument()` (already asserted on the
line above — the alt assertion can simply be deleted).

### IMP-5 — Spec signature device #1 shipped as dead CSS
`src/styles/proof-sheet.css:3-24`

`.proof-grid` / `.proof-grid__col` (the "visible column grid — 1px hairlines between layout
columns on ≥1024px", spec §2 device 1, plan Wave 0 "grid rules") has **zero consumers** in
`src/` or `tests/`. The device was authored in Wave 0 and never wired into any page, so the
spec device is missing from the shipped UI *and* the CSS is dead.

**Fix** — pick one:
- Wire it: `.proof-studios-page` and `.proof-room-page` are already `position: relative`
  (`proof-sheet.css:292, 387`); render
  `<div aria-hidden="true" className="proof-grid">{Array.from({length:12}).map(...)}</div>`
  as the first child of each, or
- Delete `proof-sheet.css:3-24` and note the device as descoped in the spec.

### IMP-6 — Film strip loads 6 unoptimized full-size images via raw `<img>`
`src/components/ui/film-strip.tsx:27` (consumer `src/app/studios/page.tsx:66`)

New `@next/next/no-img-element` warning (the only new lint warning in the range). The rail
renders at 150×100 (`proof-sheet.css:147-155`) but fetches the full room-detail webps —
15 KB + 29 KB + 65 KB + 74 KB + 75 KB + 78 KB ≈ **336 KB** — eagerly, below the fold, on
`/studios`. `next/image` would serve ~150px AVIF variants.

**Fix:**
```tsx
import Image from "next/image";
const media = (
  <Image alt={item.alt} className="film-strip__media" height={100} src={item.src} width={150} />
);
```
Minimum acceptable: keep `<img>` but add `loading="lazy" decoding="async" width={150} height={100}`
and keep the eslint-disable comment with a justification (as `vietqr-payment.tsx:41` does).

---

## Minor

### MIN-1 — LED device implemented twice; the admin device leaks onto a customer page
`src/styles/proof-sheet.css:157-191` (`.led-status`) vs `src/styles/proof-admin.css:279-334` (`.console-status`)

Two independent implementations of the same spec device #6 — identical dot geometry
(`0.4375rem`, `border-radius: 50%`, `flex-shrink: 0`) and identical label typography
(mono / `0.6875rem` / `500` / `0.06em` / uppercase). ~55 duplicated lines.

Worse for layering: `BookingStatusBadge` (a `.console-status` consumer) is rendered by
`CustomerBookingRail` on `/account/bookings` (`booking-list.tsx:99`), so `proof-admin.css` —
documented as "console shell for /admin pages" — is no longer admin-only.

No test asserts `.console-status` (only `led-status.test.tsx` touches the other), so
unification is safe.

**Fix (defer-able):** make `BookingStatusBadge` render `<LedStatus>`, move the six booking-status
tones onto `.led-status[data-tone="pending-payment"|…]` in `proof-sheet.css`, delete
`proof-admin.css:279-334`. Keep the per-tone **label** colors — they are the AA-verified ones
(all ≥4.5:1 on `--color-surface`; verified: warning 4.63, info 6.92, success 7.01,
danger 6.79, completed 7.95).

### MIN-2 — Token alias drift on the room-accent bar *(Wave-2 reviewer's nit — MUST-FIX, trivial)*
`src/styles/proof-admin.css:389-390` vs `src/styles/proof-sheet.css:827-828`

```css
.console-agenda-entry[data-room-material="photo"]::before { background: var(--color-brass); }
.console-agenda-entry[data-room-material="music"]::before { background: var(--color-sage); }
/* vs */
.account-log-row[data-room-material="photo"].log-row::before { background: var(--color-accent); }
.account-log-row[data-room-material="music"].log-row::before { background: var(--color-success); }
```
`--color-brass`/`--color-sage` are pure aliases (`tokens.css:27, 29`), so values match and there
is no visual bug — but the same device is expressed two ways. **Fix:** change `proof-admin.css:389-390`
to `--color-accent` / `--color-success` (the base tokens, matching the newer file).

### MIN-3 — Stale comments referencing the deleted `.account-ticket` *(ledger deferred nit — MUST-FIX, trivial)*
`src/features/dashboard/presentation/booking-calendar.tsx:29` — `(mirrors .account-ticket's convention)`
`src/styles/proof-admin.css:373` — `Room accent bar mirrors .account-ticket[data-room-material]::before.`

`.account-ticket` was renamed to `.account-log-row` in Wave 2 and no longer exists.
**Fix:** replace both with `.account-log-row`.

### MIN-4 — `led-status__label` has no CSS rule
`src/components/ui/led-status.tsx:10`

The class is emitted but defined nowhere, while the parallel `.console-status__label`
(`proof-admin.css:303`) carries the label color. **Fix:** either add
`.led-status__label { color: inherit; }` alongside the tone rules, or drop the class and
render the bare text node. (Resolved for free if MIN-1 is taken.)

### MIN-5 — Dead `className` on the room hero CropFrame
`src/app/studios/[slug]/page.tsx:52` — `<CropFrame className="proof-room-hero__frame">`

CSS defines `.proof-room-hero__frame-wrap` (`proof-sheet.css:395`) but never
`.proof-room-hero__frame`. Sizing is actually carried by `.proof-room-hero__visual`
(`proof-sheet.css:403-406`). **Fix:** drop the `className` prop, or add the rule if a
distinct hook was intended.

### MIN-6 — Dead editorial CSS the Wave-2 cleanup missed
Spec §5: "Blocks that become dead after migration are DELETED in the same wave that removes
their last consumer." All seven below had consumers at `308d222` and zero consumers at HEAD:

| Block | Location | Last consumer (at 308d222) |
|---|---|---|
| `.studios-atlas` | `utilities.css:141-143` | `app/studios/page.tsx` |
| `.facts-rail` (+ `> *`, `> * + *`, and the media-query variants) | `utilities.css:180-192`, `466-472` | `app/studios/[slug]/page.tsx` |
| `.confirmation-page__code` | `utilities.css:323` | `app/booking/[id]/confirmation/page.tsx` |
| `.booking-summary__deposit` | `utilities.css:402` | `booking-summary.tsx` |
| `.confirmation-remaining__amount` | `utilities.css:442` | `app/booking/[id]/confirmation/page.tsx` |
| `.admin-catalog-summary` (+ `::-webkit-details-marker`) | `forms.css:135-147` | `app/admin/rooms|services/page.tsx` |
| `.admin-catalog-edit` | `forms.css:149` | `app/admin/rooms|services/page.tsx` |

**Fix:** delete. (`.ui-action--secondary/--tertiary` and `.page-heading--default` also read as
unused but are composed at runtime via `` `ui-action--${variant}` `` / `` `page-heading--${…}` `` —
keep them.)

### MIN-7 — Unmatchable selector + unnecessary `!important` on the service thumbnail
`src/styles/proof-sheet.css:543-552`

`RoomVisual` renders the `<figure>` **itself** as its root (`room-visual.tsx:51-56`), so
`.service-row__thumb-image figure { … }` targets a descendant that never exists — dead rule.
`.service-row__thumb-image { position: relative !important; }` is also fighting nothing:
`.room-visual` is already positioned.
**Fix:** delete `proof-sheet.css:549-552` and drop the `!important`.

### MIN-8 — No-op ledger border reset leaves a trailing hairline
`src/styles/proof-sheet.css:721`

```css
.payment-ledger > .ticket-stub__row:first-child { border-block-start: 0; }
```
`.ticket-stub__row` only declares `border-block-end` (`proof-sheet.css:269`), so this never
matches anything. The actual artifact is a dangling border under the **last** ledger row.
**Fix:** `.payment-ledger > .ticket-stub__row:last-child { border-block-end: 0; }`
(the sibling rule at `:720` for `.copy-payment-value` is correct — that block does set
`border-block-start`).

### MIN-9 — `.service-row` styling split across two files
`src/styles/utilities.css:144-176` and `src/styles/proof-sheet.css:502-525`

Both files set `display`, `gap`, `border-block-end`, `padding-block` and (for `__details`)
`justify-items` on the same element. `service-card.tsx:14` always emits
`className="service-row log-row"`, so the utilities.css base is now permanently overridden
for those properties. Drift risk.
**Fix:** fold the still-needed `utilities.css` declarations (`__identity`, `__description`,
`__duration`, `__price`) into the proof block and delete the overridden `.service-row` /
`.service-row__details` base rules.

### MIN-10 — e2e assertion weakened rather than scoped
`tests/e2e/public-catalog.spec.ts:16`

```ts
await expect(page.getByRole("img", { name: new RegExp(room.name) }).first()).toBeVisible();
```
`.first()` was added (commit `a69eba7`) because the new film-strip alts
("Chi tiết ánh sáng — Photo Studio") also match `new RegExp(room.name)`. This silently accepts
a filmstrip thumbnail as proof that the room frame rendered.
**Fix:** scope instead — `page.locator(".proof-contact-sheet").getByRole("img", { name: … })`
and drop `.first()`.

### MIN-11 — `FolioLabel` is decorative chrome but is not `aria-hidden`
`src/components/ui/folio-label.tsx:4`

Every other decorative device is correctly hidden — crop marks (`crop-frame.tsx:17`),
ghost index (`ghost-index.tsx:5`), film-strip sprockets (`film-strip.tsx:14`). The folio label
is not, so screen readers announce e.g. "MOW · PROOF 02/03 — PHÒNG CHỤP ẢNH" **before** the `<h1>`
on 5 pages (`/studios`, `/studios/[slug]`, `/services/[slug]`, `/account/bookings`, `/admin/**`).
**Fix:** `<p aria-hidden="true" className="folio-label">{text}</p>` — consistent with the other
four primitives; no test asserts its accessible name.

### MIN-12 — Console nav focus indicator equals its hover state and kills the global outline
`src/styles/proof-admin.css:95-101`

```css
.console-nav-link:hover,
.console-nav-link:focus-visible { background: …; border-color: var(--color-border); …; outline: none; }
```
The global focus ring (`base.css:16`) uses `:where(...)` (0 specificity), so `outline: none` wins,
leaving keyboard users a `--color-border` (#c9c0b6 on #f7f5ef ≈ 1.6:1) border change that is
indistinguishable from hover. **Not a regression** — copied verbatim from `.admin-nav-link`
(`editorial-admin.css@308d222:73-79`) — but this range is the natural moment to fix it.
**Fix:** drop `outline: none` from the `:focus-visible` branch (split the selector).

### MIN-13 — CropFrame added without re-indenting the wrapped JSX
`src/features/booking/presentation/booking-wizard.tsx:97-162` — the five `{step === n && …}`
blocks are now one level deeper but keep their old indentation. Cosmetic; prettier/eslint do
not flag it.

---

## 1. Cross-track consistency — summary

| Device | Public/booking (`proof-sheet.css`) | Admin (`proof-admin.css`) | Verdict |
|---|---|---|---|
| LED status | `.led-status` :157-191 | `.console-status` :279-334 | **Duplicated** — MIN-1 |
| Log/table row | `.log-row` :199-233 | `.console-row` :198-239 | Legitimately different (session log vs dense table) — OK |
| Room accent bar | `.account-log-row::before` :817-828 | `.console-agenda-entry::before` :379-390 | Same geometry, **alias drift** — MIN-2 |
| Crop marks / ghost index / film strip / folio | single impl, shared primitives | reuses `FolioLabel` (`admin-shell.tsx:62`) | Correctly reused — OK |
| Empty state | `EmptyState` primitive | `.console-empty-state` | Divergent by design (inline `<p>` in tables) — OK |
| Text action | `.ui-action--*` | `.console-text-action` :519-544 | Justified (documented quiet-delete affordance) — OK |

Naming is coherent within each layer (`proof-*`/device names public-side, `console-*` admin-side).
The only genuine boundary violation is `.console-status` rendering on `/account/bookings` (MIN-1).

## 5. Accessibility cross-check — summary

- **record-red as text:** only one site — `.log-row[data-state="active"] .log-row__index`
  (`proof-sheet.css:231`), which inherits into the LED label on the active wizard step. Its
  background is `--color-surface-raised` (same rule block, `:227`) → **#b8371f on #fffdf8 = 5.73:1, AA pass**.
  (For reference: 5.34:1 on `--color-surface`, 4.48:1 on `--color-canvas` — so the constraint
  holds only because the active row is raised. Worth a comment in the CSS.) Other two uses are
  dot-only (`:183`) and the selected-slot inset ring (`:703`) — both spec-sanctioned.
- **Reduced motion:** `led-record-pulse` and `log-frame-enter` both disabled
  (`proof-sheet.css:284-286, 696-698`) on top of the global kill-switch (`base.css:21-27`). ✅
- **Focus visibility:** global ring at `base.css:16-19`; `.console-text-action` has an explicit
  ring (`proof-admin.css:541-544`). Two problems: IMP-3 (clipped in the wizard) and MIN-12
  (console nav). `.console-row-primary:focus-visible` and `.console-catalog-summary` keep the
  global outline. ✅
- **aria on decorative devices:** crop marks ✅, ghost index ✅, sprockets ✅,
  `.console-table-head` ✅ (`aria-hidden`, data cells are self-describing) — folio label ❌ (MIN-11).
- **Touch targets:** console side is uniformly ≥2.75rem (nav link, mobile select, catalog
  summary, calendar inputs, text action) ✅; public side regressed — IMP-1.
- **LED dot never the sole signal:** every `LedStatus`/`console-status`/`StatusDot` call site
  passes a text `label`. ✅

## 6. Triage of the PS-section deferred nits

| Ledger entry | Verdict |
|---|---|
| Wave 2: "cosmetic nit deferred: stale comment `booking-calendar.tsx:29`" | **MUST-FIX (trivial)** — still present, and a second instance exists at `proof-admin.css:373`. See MIN-3. |
| Wave 2 reviewer: brass/sage alias naming inconsistency | **MUST-FIX (trivial)** — confirmed at `proof-admin.css:389-390`; values identical so zero visual risk. See MIN-2. |
| Wave 1 Track P: "service log rows missing per-service thumbnail vs mockup" | **OBSOLETE** — delivered in `4206682`. But the fix introduced IMP-4 (`alt={\`Phòng\`}`), which the deferred-nit closure did not re-review. |

---

## Recommended fix wave (one pass)

**Blocking-ish (do all six):** IMP-1 (2 CSS rules) · IMP-2 (1 CSS rule) · IMP-3 (1 CSS rule) ·
IMP-4 (1 tsx line + 1 test line) · IMP-5 (wire or delete) · IMP-6 (`next/image` swap in `film-strip.tsx`).

**Cheap and worth batching:** MIN-2, MIN-3, MIN-5, MIN-6, MIN-7, MIN-8, MIN-11, MIN-12.

**Defer to a follow-up:** MIN-1 (LED unification — a real refactor), MIN-9 (`.service-row`
consolidation), MIN-10 (e2e scoping), MIN-13 (indentation).

Re-run `tsc` + `vitest` + `pnpm build` + full Playwright after the wave; IMP-4 and MIN-10 touch
test files, IMP-6 changes the `/studios` DOM (`<img>` → `next/image` wrapper), so
`public-catalog.spec.ts` needs a re-run in particular.

## Unresolved questions

1. IMP-5 — is the column-grid device descoped, or was wiring it simply missed? The mockups are
   authoritative and I did not open them; the answer decides "wire" vs "delete".
2. IMP-2 — was `<LedStatus>` inside the primary CTA a deliberate mockup detail (record dot on
   the booking button) or an over-application of the device? The proposed fix keeps the dot and
   only restores button typography, which should satisfy either reading.
3. MIN-1 — unifying `.console-status` into `.led-status` is safe test-wise but touches admin +
   account rendering; confirm the controller wants it in this branch rather than a follow-up.
