# MowStudio Cozy Dark UI System — Design Specification

**Status:** Ready for user review

**Date:** 2026-07-15

**Direction:** Cinematic Continuity

**Scope:** All customer-facing and admin pages outside the completed home hero

## 1. Purpose

Extend the visual language established by the MowStudio scroll hero across the rest of the product. Every page must feel like the same warm, quiet creative studio while adapting its density and motion to the task.

The system has one non-negotiable tone: **cozy, dark, minimal**. Public discovery may be cinematic, booking and account pages must feel calm and focused, and admin pages may be denser but must not become a light or generic SaaS dashboard.

## 2. Scope

### Included

- Global header, mobile navigation, page shells, and footer.
- `/studios`, `/studios/[slug]`, and `/services/[slug]`.
- `/booking/[id]`, payment, and confirmation pages.
- `/login`, `/register`, and customer booking pages.
- Admin shell and all current admin pages.
- Shared visual tokens and repeated presentation primitives.
- Desktop, mobile, keyboard, reduced-motion, loading, empty, error, and success states.

### Excluded

- Changes to routes, domain rules, database schema, API contracts, booking state transitions, or authorization.
- A CMS, gallery model, equipment inventory, or new marketing content model.
- A complex month/week calendar grid.
- A general-purpose component library beyond primitives used by the current product.
- Reworking the completed hero composition or canvas sequence.

## 3. Design goals

1. A visitor moving from the hero to a room, service, and booking flow should perceive one continuous product.
2. Each page should reveal its primary task and next action within a few seconds.
3. Operational screens should support faster scanning without abandoning the cozy brand tone.
4. Repeated UI should derive from a small token and primitive layer rather than copied Tailwind strings.
5. The system must remain usable at 375px, by keyboard, and with reduced motion enabled.

## 4. Visual direction

### 4.1 Concept: Cinematic Continuity

The hero is the visual thesis. Its dark stage, warm light, capsule rooms, restrained type, and single orchestrated motion continue through the product in progressively quieter forms:

- **Public discovery:** image-led, spacious, and cinematic.
- **Booking and payment:** focused, reassuring, and task-led.
- **Auth and account:** personal, calm, and legible.
- **Admin:** compact and operational, but still warm dark minimal.

### 4.2 Palette

| Token | Value | Role |
|---|---:|---|
| Void | `#070807` | Page background and hero continuity |
| Ink | `#0F0E0C` | Recessed areas and navigation |
| Espresso | `#1C1917` | Primary surfaces, fields, and panels |
| Warm line | `#39332C` | Borders, dividers, and inactive controls |
| Bone | `#F5F3ED` | Primary text and light QR surface |
| Brass | `#D9BF83` | Labels, active states, and important data |
| Champagne | `#EFD2A0` | Primary calls to action |

Semantic colors must be muted and used only for status:

- Confirmed/success: dusty sage.
- Pending/warning: warm amber.
- Cancelled/error: muted clay.
- Expired/completed: smoke neutral.

The semantic label remains mandatory; color is never the only status signal.

### 4.3 Typography

- **Display and body:** Plus Jakarta Sans via `next/font`. It supports Vietnamese and keeps the geometric confidence of the hero without relying on the current system Helvetica stack.
- **Utility and data:** IBM Plex Mono for booking codes, price, time, status metadata, and operational labels.
- **Wordmark:** Preserve the existing custom MOW treatment.

Headings use tight tracking and controlled line length. Body copy stays conversational with generous line height. Uppercase and wide tracking are reserved for short eyebrows and utility labels, never paragraphs.

### 4.4 Shape and spacing

- Desktop layout: 12-column grid.
- Mobile layout: 4-column grid.
- Public maximum width: `92rem`.
- Booking/account maximum width: `72rem`.
- Admin uses available width inside its navigation shell.
- Base spacing rhythm: 8px with intentional 4px exceptions for compact metadata.
- Radius scale: 12px, 20px, and 32px derived from the room capsules.
- Fully rounded pills are limited to status, tags, short controls, and primary actions.
- Borders are one pixel and low contrast. Shadows and blur are exceptional, not default.

### 4.5 Signature element: Capsule window

The room capsule is the recognizable MowStudio device, not a generic rounded card.

- Public pages use it as a portal around room visuals.
- Booking uses it as the frame around the active task.
- Account pages use a restrained capsule rail for booking history.
- Admin uses it only for active navigation and selected state.

Only one strong capsule treatment should dominate a screen. Repeating it on every card would weaken the signature.

### 4.6 Room materials

Each room inherits a material accent from the hero:

- Photo Studio: warm ivory.
- Voice/Podcast Booth: soft graphite.
- Music Studio: muted sage.

These colors identify room context in imagery, hover treatment, and small metadata accents. They do not replace the shared page background or primary action color.

### 4.7 Motion

Each page family gets one coordinated motion idea:

- Public: page entrance or a restrained scroll reveal.
- Booking: directional step transitions of 12–16px.
- Account/admin: micro-interactions between 160–220ms.

Motion must not delay reading or action. Reduced-motion mode removes scroll choreography, large transforms, blur transitions, and nonessential movement.

## 5. Shared shells and primitives

### 5.1 Public shell

- Wordmark on the left, room navigation in the center, and account/booking action on the right.
- On the home hero, the header remains an overlay.
- On internal pages, it becomes a warm dark sticky header with a hairline border.
- Mobile uses a compact menu panel for room and account links.
- The footer contains room links, booking action, contact context, and studio timezone without becoming a large marketing sitemap.

### 5.2 Transaction shell

Booking routes use a quieter shell with wordmark, back-to-service navigation, and progress context. Discovery navigation is omitted during booking to reduce distraction.

Desktop uses an 8/4 content-summary split. Mobile places a collapsible summary before the active task.

### 5.3 Admin shell

- Sticky navigation rail around 240px on desktop.
- Navigation groups: Operations, Finance, and Configuration.
- Active navigation uses a small inset capsule and Brass indicator.
- Mobile uses a compact top navigation or drawer.
- The shell stays dark, warm, and minimal; it never switches to a cool or light dashboard theme.

### 5.4 Reusable presentation primitives

Create only primitives already repeated by current screens:

- Action button/link variants.
- Form field, label, help, validation, and textarea/select treatment.
- Surface/capsule panel.
- Status badge.
- Page heading and eyebrow.
- Facts rail.
- Empty, loading, error, and success state.

The hero remains a bespoke composition and shares only tokens and action treatments.

## 6. Public discovery pages

### 6.1 `/studios`: Room atlas

Replace the equal three-card grid with three large alternating room rows. Each row pairs a capsule visual with the room name, description, service count, and route action.

```text
[ Introduction / studio philosophy                 ]

[ capsule visual ] [ Photo Studio                  ]
[ room portal    ] [ description, service count → ]

[ Podcast Booth  ] [ capsule visual                ]
[ description  → ] [ room portal                   ]

[ capsule visual ] [ Music Studio                  ]
```

The room rows are not numbered because they are categories, not steps. Hover and focus move the visual only slightly and strengthen its capsule border. Mobile places each visual above its content.

### 6.2 `/studios/[slug]`: Room portal

- A 60–70vh image-led opening with room name, short description, and room material accent.
- A facts rail containing only data currently available, such as active service count.
- Services appear as rich horizontal rows rather than identical generic cards.
- The closing action leads to the relevant service and booking path.

Equipment specifications and multi-image galleries remain excluded until supported by real content.

### 6.3 `/services/[slug]`: Service sheet

Desktop uses a 7/5 split:

- Left: service name, description, room context, and booking type explanation.
- Right: sticky price panel with duration, buffer, 30% deposit explanation, and booking action.

Mobile places the price panel directly after the heading and may use a controlled bottom booking action. The panel must not obscure content or duplicate multiple primary actions in one viewport.

### 6.4 Asset strategy

Reuse the existing capsule sequence and derive approved crops or still frames for the three rooms. Do not add a CMS or database media fields solely for this visual pass.

## 7. Booking and payment

### 7.1 Booking wizard

Preserve current booking behavior and server authority. Restyle the existing steps as a single progress rail rather than five unrelated pills.

- Active step: Champagne fill.
- Completed path: Brass line.
- Future path: Warm line.
- The active task sits in one large capsule window.
- Back actions are tertiary; forward actions use specific verbs.
- Fields are at least 48px high with a clear Brass focus state.
- Time slots use tabular typography and strong selected states.

The style phase does not reorder steps or change booking state logic.

### 7.2 Failure and empty states

- A stale slot preserves contact data and returns the user to time selection.
- No availability explains the condition and offers another date.
- Field errors appear near their fields, with an accessible summary where appropriate.
- Loading uses useful progress language or a skeleton; spinners are not the default response.

### 7.3 Payment

- Hold countdown appears as primary transaction context near the top.
- The QR code sits on a Bone surface for reliable scanning.
- Account number and transfer content use mono typography with copy actions.
- Deposit, total, and remaining balance have explicit hierarchy.
- Payment status appears in its own rail rather than inside the QR card.

### 7.4 Confirmation

The booking state becomes the main heading. Booking code uses mono typography, followed by summary and the next valid action for the current state. Celebration remains restrained; no confetti or unrelated animation.

## 8. Authentication and customer account

### 8.1 Login and registration

- Desktop uses a 5/7 split with the form on one side and one capsule visual plus a short brand statement on the other.
- Mobile removes the large visual and keeps the wordmark and form in one column.
- Google authentication is a secondary action separated by an explicit “or” label.
- Errors are specific and close to the cause. Registration success clearly directs the user to email verification.

The design avoids the generic centered SaaS card pattern.

### 8.2 `/account/bookings`

- Page heading, short account context, and booking filter.
- Guest-booking claim appears as a contextual strip, not a competing hero.
- Booking history uses a vertical rail with date/time, service, room, and status.
- Desktop filters may use segmented controls; mobile retains a native select.
- Empty state links back to studio discovery.

### 8.3 `/account/bookings/[id]`

- Header contains booking code, status, and primary next action.
- Content separates studio schedule, payment, and policy/action sections.
- Desktop uses two columns; mobile follows task priority.
- Cancellation remains an inline danger zone at the end of the page.

## 9. Admin pages

### 9.1 Dashboard

Use existing real data only. Show current booking total, quick actions, and recent bookings. Do not invent analytics or decorative KPI cards unsupported by the backend.

### 9.2 Booking, calendar, and payment views

- Desktop uses compact rows with clear columns rather than large cards per record.
- Mobile converts each row into a readable vertical block.
- Calendar remains an agenda grouped by day.
- Dates, times, money, and booking codes use mono typography.
- Status colors remain muted and always include labels.

### 9.3 Room and service management

- New-item form appears at the top in one capsule panel.
- Existing records appear as compact summaries and reveal editing controls when needed.
- Save remains the primary action; hide/reactivate is secondary and visually separate.
- Destructive actions do not share the primary save action group.

### 9.4 Schedule and blocked slots

- Working hours and block creation share the same form language.
- Blocked slots use an agenda/timeline presentation emphasizing room and time range.
- Delete uses a muted clay text action with clear keyboard focus.

## 10. Responsive behavior

- No horizontal overflow at 375px.
- Touch targets are at least 44px.
- Public alternating rows collapse into visual-first blocks.
- Sticky desktop summary panels return to normal document flow or a controlled disclosure on mobile.
- Admin navigation leaves enough vertical space for page content and does not create a second horizontal page scroll.
- Dense desktop rows become stacked mobile summaries without hiding required actions.

## 11. Accessibility and content

- WCAG AA contrast for text and actionable controls.
- Visible keyboard focus on every interactive element.
- Status is communicated through text and semantics, not color alone.
- Form labels remain visible; placeholders do not replace labels.
- Error, loading, and success messaging uses appropriate live-region behavior.
- Page headings and landmarks remain correctly nested.
- Vietnamese copy uses active, specific verbs and consistent action names.
- Existing accessible names relied on by end-to-end tests remain stable unless tests and product copy are deliberately updated together.

## 12. Technical organization

The current `globals.css` mixes base, shell, and hero rules and is already large. The UI implementation should split styles by concern:

```text
src/styles/
├── tokens.css
├── base.css
├── shell.css
├── hero.css
├── forms.css
└── utilities.css
```

Feature-specific presentation remains in its existing feature module. Add nested layouts only where a distinct shell is required, such as booking, account, and admin. Do not move routes into broad route groups merely to organize styles.

Keep focused files below the repository's 200-line guideline where practical. Prefer composition and small presentation modules over a single configurable mega-component.

## 13. Delivery sequence

1. Tokens, fonts, base styles, and responsive shells.
2. Studios listing, room detail, and service detail.
3. Booking wizard, payment, and confirmation.
4. Login, registration, and customer account.
5. Admin shell and all operational pages.
6. Responsive, accessibility, reduced-motion, and visual QA.

Desktop and mobile must be complete within each phase before moving to the next.

## 14. Verification

- Preserve and run current unit and end-to-end coverage.
- Add focused tests for any new stateful navigation, disclosure, copy action, or step transition.
- Verify public, booking, account, and admin page families at desktop and 375px mobile widths.
- Verify keyboard navigation, focus order, and form errors.
- Verify reduced motion and absence of horizontal overflow.
- Inspect visual consistency with the hero, especially background warmth, type hierarchy, capsule restraint, and CTA color usage.
- Run lint, typecheck, unit tests, production build, and relevant Playwright suites before completion.

## 15. Design self-review

The largest visual risk is producing another dark interface with an amber accent. The approved direction avoids that generic result through subject-specific devices: the real room capsules, distinct room materials, room-atlas layouts, studio-style utility typography, and agenda-based operational views.

The second risk is overusing rounded panels. The capsule is reserved for a dominant portal, active task, or selected state. Most information uses spacing, typography, and hairline dividers.

The third risk is carrying cinematic motion into transactional or operational work. Motion intensity deliberately decreases from public discovery to booking, account, and admin.

## 16. Decisions and unresolved questions

### Decisions

- All page families use a cozy, dark, minimal tone.
- Cinematic Continuity is the single approved direction.
- Admin remains warm dark and differs only in density and motion.
- Existing hero assets are the initial room-media source.
- UI implementation will not change domain or data contracts.

### Unresolved questions

None.
