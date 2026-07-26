# Phase 01 — Foundation and Shared Shell

## Task 1: Lock font and CSS token foundation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/app/layout.test.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/shell.css`
- Create: `src/styles/hero.css`
- Create: `src/styles/forms.css`
- Create: `src/styles/utilities.css`
- Test: `src/components/app-shell.test.tsx`

**Interfaces:**
- Produces CSS variables `--color-void`, `--color-ink`, `--color-espresso`, `--color-warm-line`, `--color-bone`, `--color-brass`, `--color-champagne`, `--font-sans`, and `--font-mono`.
- Preserves every existing `.hero-*` selector and its current behavior.

- [x] **Step 1: Add a failing root-font test and preserve shell characterization**

Create `src/app/layout.test.tsx`. Mock both `next/font/google` functions to return deterministic variables, mock `getCurrentActor`, render the awaited `RootLayout`, and require both variables on `<body>`. This must fail before the font implementation because `<body>` has no class.

```tsx
vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ variable: "font-sans-variable" }),
  IBM_Plex_Mono: () => ({ variable: "font-mono-variable" }),
}));

const layout = await RootLayout({ children: <p>Content</p> });
render(layout);
expect(document.body).toHaveClass("font-sans-variable", "font-mono-variable");
```

Keep/add these characterization assertions in `src/components/app-shell.test.tsx` so the CSS move cannot lose the existing shell contract:

```tsx
expect(container.querySelector(".app-shell")).toBeInTheDocument();
expect(container.querySelector("main.app-main")).toBeInTheDocument();
expect(screen.getByRole("link", { name: /MOW STUDIO — Trang chủ/i })).toHaveAttribute("href", "/");
```

- [x] **Step 2: Run RED and the shell baseline**

Run: `pnpm vitest run src/app/layout.test.tsx src/components/app-shell.test.tsx`

Expected: `layout.test.tsx` FAILS because the body lacks both font variable classes; `app-shell.test.tsx` PASSES.

- [x] **Step 3: Register the approved fonts**

Update `src/app/layout.tsx` with these exact font variables and apply them to `<body>`:

```tsx
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

const sans = Plus_Jakarta_Sans({
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

<body className={`${sans.variable} ${mono.variable}`}>
```

- [x] **Step 4: Create the token file**

Create `src/styles/tokens.css` with the approved warm-dark values:

```css
:root {
  color-scheme: dark;
  --color-void: #070807;
  --color-ink: #0f0e0c;
  --color-espresso: #1c1917;
  --color-warm-line: #39332c;
  --color-bone: #f5f3ed;
  --color-brass: #d9bf83;
  --color-champagne: #efd2a0;
  --color-sage: #8fa58e;
  --color-clay: #c98f7c;
  --color-smoke: #a8a29e;
  --radius-sm: 0.75rem;
  --radius-md: 1.25rem;
  --radius-lg: 2rem;
  --motion-fast: 160ms;
  --motion-base: 220ms;
  --content-public: 92rem;
  --content-transaction: 72rem;
}
```

- [x] **Step 5: Split the current stylesheet without visual changes**

Make `src/app/globals.css` an import-only entrypoint in this order:

```css
@import "tailwindcss";
@import "../styles/tokens.css";
@import "../styles/base.css";
@import "../styles/shell.css";
@import "../styles/forms.css";
@import "../styles/utilities.css";
@import "../styles/hero.css";
```

Move existing header/app-shell rules to `shell.css`, existing hero rules to `hero.css`, and document/body/reset rules to `base.css`. Do not rename selectors during this step.

- [x] **Step 6: Add base reduced-motion and focus behavior**

Add to `base.css`:

```css
html { background: var(--color-void); overflow-x: clip; }
body {
  margin: 0;
  min-height: 100vh;
  overflow-x: clip;
  background: var(--color-void);
  color: var(--color-bone);
  font-family: var(--font-sans), sans-serif;
  text-rendering: optimizeLegibility;
}
:where(a, button, input, select, textarea, summary):focus-visible {
  outline: 2px solid var(--color-brass);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [x] **Step 7: Verify the refactor**

Run: `pnpm vitest run src/components/app-shell.test.tsx src/features/home/presentation/scroll-video-hero.test.tsx && pnpm typecheck`

Expected: all tests PASS and TypeScript exits 0.

- [x] **Step 8: Hand off the foundation split for user-managed commit**

```bash
git add src/app/layout.tsx src/app/layout.test.tsx src/app/globals.css src/styles src/components/app-shell.test.tsx
# User performs the commit later: refactor: establish cozy dark style foundation
```

## Task 2: Add shared presentation primitives

**Files:**
- Create: `src/components/ui/action.ts`
- Create: `src/components/ui/page-heading.tsx`
- Create: `src/components/ui/page-heading.test.tsx`
- Create: `src/components/ui/form-field.tsx`
- Create: `src/components/ui/form-field.test.tsx`
- Create: `src/components/ui/empty-state.tsx`
- Create: `src/components/ui/empty-state.test.tsx`
- Modify: `src/styles/forms.css`
- Modify: `src/styles/utilities.css`

**Interfaces:**
- Produces the `ActionVariant`, `actionClassName`, `PageHeadingProps`, and `FormFieldProps` contracts from `plan.md`.
- Produces `EmptyState({ title, description, action? })` where `action` is `ReactNode`.

- [x] **Step 1: Write failing primitive tests**

Cover these exact behaviors:

```tsx
render(<PageHeading eyebrow="Không gian" title="Chọn studio" description="Ba không gian chuyên biệt." headingId="studios-heading" />);
expect(screen.getByRole("heading", { name: "Chọn studio" })).toHaveAttribute("id", "studios-heading");
expect(screen.getByText("Không gian")).toHaveClass("page-eyebrow");

render(<FormField label="Email" htmlFor="email" error="Email không hợp lệ"><input id="email" /></FormField>);
expect(screen.getByLabelText("Email")).toBeInTheDocument();
expect(screen.getByRole("alert")).toHaveTextContent("Email không hợp lệ");

render(<EmptyState title="Chưa có booking" description="Chọn studio để bắt đầu." />);
expect(screen.getByRole("heading", { name: "Chưa có booking" })).toBeInTheDocument();
```

- [x] **Step 2: Run tests to confirm missing modules**

Run: `pnpm vitest run src/components/ui/page-heading.test.tsx src/components/ui/form-field.test.tsx src/components/ui/empty-state.test.tsx`

Expected: FAIL with module-not-found errors.

- [x] **Step 3: Implement action variants**

Create `action.ts`:

```ts
export type ActionVariant = "primary" | "secondary" | "tertiary" | "danger";

export function actionClassName(variant: ActionVariant = "primary", compact = false) {
  return ["ui-action", `ui-action--${variant}`, compact ? "ui-action--compact" : ""].filter(Boolean).join(" ");
}
```

- [x] **Step 4: Implement page, field, and empty-state components**

Use semantic structures with these root classes:

```tsx
<header className={`page-heading page-heading--${size}`}>
  {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
  <h1 id={headingId}>{title}</h1>
  {description ? <p className="page-description">{description}</p> : null}
</header>
```

```tsx
<div className="ui-field">
  <label htmlFor={htmlFor}>{label}</label>
  {children}
  {hint && !error ? <p className="ui-field__hint">{hint}</p> : null}
  {error ? <p className="ui-field__error" role="alert">{error}</p> : null}
</div>
```

```tsx
<section className="empty-state">
  <h2>{title}</h2>
  <p>{description}</p>
  {action ? <div className="empty-state__action">{action}</div> : null}
</section>
```

- [x] **Step 5: Add primitive styles**

Implement `.ui-action`, `.page-heading`, `.page-eyebrow`, `.page-description`, `.ui-surface`, `.facts-rail`, and `.empty-state` in `utilities.css`. Implement `.ui-field` and native input/select/textarea states in `forms.css`. Primary actions use Champagne on Void; secondary actions use a Warm line border; danger actions use Clay without neon saturation.

- [x] **Step 6: Run primitive tests**

Run: `pnpm vitest run src/components/ui`

Expected: PASS.

- [x] **Step 7: Hand off primitives for user-managed commit**

```bash
git add src/components/ui src/styles/forms.css src/styles/utilities.css
git commit -m "feat: add shared UI presentation primitives"
```

## Task 3: Complete responsive global navigation and footer

**Files:**
- Create: `src/components/site-footer.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/app-shell.test.tsx`
- Modify: `src/styles/shell.css`

**Interfaces:**
- `SiteFooter()` renders room links, booking CTA, and `Asia/Ho_Chi_Minh` context.
- AppShell continues accepting `{ actor, children, onSignOut }` unchanged.

- [x] **Step 1: Write failing navigation/footer tests**

Add assertions for a mobile `<details>` menu and footer:

```tsx
expect(screen.getByText("Menu", { selector: "summary" })).toBeInTheDocument();
expect(screen.getByRole("contentinfo")).toHaveTextContent("Asia/Ho_Chi_Minh");
expect(screen.getByRole("link", { name: "Đặt lịch" })).toHaveAttribute("href", "/studios");
```

- [x] **Step 2: Run the focused test and verify failure**

Run: `pnpm vitest run src/components/app-shell.test.tsx`

Expected: FAIL because mobile menu and footer do not exist.

- [x] **Step 3: Implement `SiteFooter`**

Render a `footer.site-footer` with the MOW wordmark text, the existing three room links, a primary `/studios` booking link, and the line `Sài Gòn · Asia/Ho_Chi_Minh`.

- [x] **Step 4: Add a no-JavaScript mobile menu**

Add this structure beside the desktop navigation:

```tsx
<details className="site-mobile-menu">
  <summary>Menu</summary>
  <nav aria-label="Điều hướng mobile">
    {studioLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
    <AccountActions actor={actor} onSignOut={onSignOut} />
  </nav>
</details>
```

Keep the current desktop navigation and accessible names unchanged. Render `<SiteFooter />` after `<main>` and hide it for `.app-shell:has(#home-hero)` so the existing hero remains untouched.

- [x] **Step 5: Add responsive shell styles**

Show `.site-mobile-menu` below 640px and `.site-nav` from 640px upward. Style the open panel with Ink/Espresso surfaces, Warm line borders, and at least 44px link targets. Make internal-page header sticky; preserve absolute overlay behavior when `#home-hero` exists.

- [x] **Step 6: Verify navigation variants**

Run: `pnpm vitest run src/components/app-shell.test.tsx && pnpm typecheck`

Expected: PASS.

- [x] **Step 7: Hand off shared shell for user-managed commit**

```bash
git add src/components/app-shell.tsx src/components/app-shell.test.tsx src/components/site-footer.tsx src/styles/shell.css
git commit -m "feat: add responsive site shell and footer"
```

## Phase 01 Gate

- [x] Run `pnpm lint` and expect exit 0.
- [x] Run `pnpm vitest run src/components src/features/home/presentation/scroll-video-hero.test.tsx` and expect PASS.
- [x] Render `/` and `/studios` at 1440px and 375px; confirm the hero is visually unchanged and internal shell uses warm dark tokens.
