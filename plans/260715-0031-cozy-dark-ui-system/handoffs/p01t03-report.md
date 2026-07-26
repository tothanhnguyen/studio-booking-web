# Phase 01 Task 3 — Responsive global navigation and footer

## Status

Complete. Added the no-JavaScript responsive navigation and shared site footer without changing the `AppShell({ actor, children, onSignOut })` interface, existing labels/routes, auth behavior, or home-hero overlay behavior.

## Implementation

- Added `SiteFooter()` with the shared MOW wordmark, Photo/Podcast/Music routes, `/studios` booking CTA, and `Sài Gòn · Asia/Ho_Chi_Minh` context.
- Moved the existing room-link data beside `SiteFooter` and reused it in desktop navigation, mobile navigation, and footer to avoid route/label drift.
- Added a native `<details>` / `<summary>` mobile menu containing the existing account actions.
- Added responsive CSS: mobile menu below 640px, desktop navigation from 640px, 44px minimum mobile targets, tokenized Ink/Espresso surfaces and Warm-line borders.
- Made internal-page headers sticky while retaining the existing absolute home-hero overlay. The footer is suppressed only when the shell contains `#home-hero`.
- Updated jsdom tests with scoped navigation queries and explicit duplicate auth assertions because external responsive CSS is not applied by jsdom.

## Files

- `src/components/site-footer.tsx` — created.
- `src/components/app-shell.tsx` — mobile menu, shared links, footer render.
- `src/components/app-shell.test.tsx` — responsive navigation/footer behavior and duplicate auth coverage.
- `src/styles/shell.css` — responsive shell/footer styling; 197 lines.
- `plans/260715-0031-cozy-dark-ui-system/handoffs/p01t03-report.md` — this report.

## TDD evidence

### RED

Command:

```text
pnpm vitest run src/components/app-shell.test.tsx
```

Result: exit 1; 1 passed, 3 failed for the intended missing behavior:

- no `summary` with text `Menu`;
- authenticated customer actions appeared once instead of in desktop and mobile navigation;
- administrator action appeared once instead of in desktop and mobile navigation.

### GREEN

After the minimal component/CSS implementation, the same focused command exited 0 with 4/4 tests passing. After the CSS line-count refactor, it again exited 0 with 4/4 tests passing.

## Verification

| Command/check | Result |
| --- | --- |
| `pnpm vitest run src/components/app-shell.test.tsx && pnpm typecheck` | PASS — 4/4 tests; TypeScript exit 0 |
| `pnpm eslint src/components/app-shell.tsx src/components/app-shell.test.tsx src/components/site-footer.tsx` | PASS — exit 0, no output |
| `pnpm lint` | PASS — exit 0 |
| `pnpm vitest run src/components src/features/home/presentation/scroll-video-hero.test.tsx` | PASS — 5 files, 12/12 tests |
| `pnpm test` | PASS — 43 files, 133/133 tests; run once as requested |
| Local render `/` at 1440x900 and 375x812 | PASS — HTTP 200; hero visually unchanged, header remains absolute, footer hidden; desktop/mobile visibility switches at 640px |
| Local render `/studios` at 1440x900 and 375x812 | PASS — HTTP 200; header sticky, footer visible, warm dark surfaces/borders intact |
| Mobile open-menu measurements | PASS — visible links/buttons measured 44–45px high; Ink/Espresso gradient and Warm-line border computed correctly |

## Self-review

- `AppShell` props and `AccountActions` branching are unchanged.
- Existing MOW, room, login/register, account, admin, and logout labels/routes are preserved.
- Desktop and mobile auth behaviors are asserted, not hidden from jsdom assertions.
- Home hero is not structurally changed; preservation is driven by the existing `:has(#home-hero)` shell condition.
- Native `<details>` provides no-JavaScript disclosure behavior and keyboard-accessible summary semantics.
- All source edits are limited to task-listed files. No git stage/commit/push/switch/stash/reset/index operations were run.

## Concerns / unresolved questions

- Non-blocking existing test-environment noise: the passing full suite logged two redacted `readiness.check_failed` connection timeouts before completing 133/133 tests with exit 0.
- No unresolved implementation questions.

## Reviewer Fixes

### Findings resolved

- Added explicit `min-height: 2.75rem` and centered flex alignment to the desktop wordmark, room links, and auth link. CTA/logout behavior was left unchanged.
- Changed `.site-nav-email` to the approved `var(--color-smoke)` token, including inside the mobile Ink/Espresso panel.
- Changed the internal sticky header to `var(--color-ink)` with a 1px `var(--color-warm-line)` bottom hairline.
- Added an explicit transparent hairline override to the existing home-hero header rule; its absolute positioning and gradient remain unchanged.
- Restored explicit `/account/bookings` `href` assertions for both responsive `Booking của tôi` links.

### RED / characterization evidence

The booking route was already correct in production, so no fake production failure was manufactured. The characterization assertion was added first and this command remained green:

```text
pnpm vitest run src/components/app-shell.test.tsx
```

```text
Test Files  1 passed (1)
Tests       4 passed (4)
```

The pre-change inline Node + Playwright source/computed guard used `src/styles/shell.css`, `/studios` at 1440px and 375px, and `/` at 1440px. It exited 1 with the real reviewer failures:

```text
{"source":{"emailSmoke":false,"headerInk":false,"headerWarmLine":false,"heroBorderOverride":false},"internal":{"wordmarkHeight":48,"roomHeights":[45,45,45],"authHeight":21,"headerBackground":"rgba(7, 8, 7, 0.94)","headerBorderWidth":"0px","headerBorderColor":"lab(96.5286 -0.0991821 0.364268)"},"mobile":{"emailColor":"rgb(120, 113, 108)","targetHeights":[44,44,44,44,45]},"hero":{"position":"absolute","borderColor":"lab(96.5286 -0.0991821 0.364268)"}}
desktop auth target <44px; mobile email is not Smoke; internal header is not Ink; internal header lacks Warm-line hairline; required token/hero source guard missing; hero overlay/border override missing
```

An explicit source guard for the reviewer’s declaration-level target requirement also exited 1 before the CSS change:

```text
node -e 'const fs=require("fs"); const css=fs.readFileSync("src/styles/shell.css","utf8"); const block=(selector)=>{const start=css.indexOf(`${selector} {`); return start<0?"":css.slice(start,css.indexOf("}",start)+1)}; const shared=block(".site-room-links a,\n.site-nav-auth-link"); const result={wordmarkExplicit44:block(".site-wordmark").includes("min-height: 2.75rem"),roomAndAuthExplicit44:shared.includes("min-height: 2.75rem"),roomAndAuthFlexAligned:shared.includes("display: inline-flex")&&shared.includes("align-items: center")}; console.log(JSON.stringify(result)); if(Object.values(result).some((value)=>!value)) process.exit(1);'
```

```text
{"wordmarkExplicit44":false,"roomAndAuthExplicit44":false,"roomAndAuthFlexAligned":false}
```

### GREEN guard evidence

The same computed/source assertions exited 0 after the minimal CSS change:

```text
{"source":{"emailSmoke":true,"headerInk":true,"headerWarmLine":true,"heroBorderOverride":true},"internal":{"wordmarkHeight":48,"roomHeights":[45,45,45],"authHeight":44,"headerBackground":"rgb(15, 14, 12)","headerBorderWidth":"1px","headerBorderColor":"rgb(57, 51, 44)"},"mobile":{"emailColor":"rgb(168, 162, 158)","targetHeights":[44,44,44,44,45]},"hero":{"position":"absolute","borderColor":"rgba(0, 0, 0, 0)"}}
```

The same explicit declaration guard exited 0:

```text
{"wordmarkExplicit44":true,"roomAndAuthExplicit44":true,"roomAndAuthFlexAligned":true}
```

Post-change screenshots of `/` and `/studios` at 1440px were visually reviewed. The home overlay is unchanged; the internal header now has the subtle Warm-line hairline.

### Focused verification

| Exact command | Output/result |
| --- | --- |
| `pnpm vitest run src/components/app-shell.test.tsx` | PASS — 1 file, 4/4 tests |
| `pnpm typecheck` | PASS — `tsc --noEmit`, exit 0 |
| `pnpm eslint src/components/app-shell.tsx src/components/app-shell.test.tsx src/components/site-footer.tsx` | PASS — exit 0, no output |

### Reviewer-fix files

- `src/styles/shell.css`
- `src/components/app-shell.test.tsx`
- `plans/260715-0031-cozy-dark-ui-system/handoffs/p01t03-report.md`

### Reviewer-fix self-review

- All desktop navigation targets named by the review have explicit 44px minimum height and centered flex alignment; computed measurements are 44–48px.
- Smoke on Ink/Espresso computes to `rgb(168, 162, 158)`, replacing the failing `rgb(120, 113, 108)` value.
- Internal header tokens compute exactly to Ink `rgb(15, 14, 12)` and Warm line `rgb(57, 51, 44)`.
- The home header remains `position: absolute`; its new border computes transparent and its gradient remains intact.
- Both responsive customer booking links are checked for count and exact destination.
- `shell.css` remains within the repository file-size guideline at 199 lines.
- No unrelated source files or Git/index state were changed.

### Reviewer-fix concerns

- None.
