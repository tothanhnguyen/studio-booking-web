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

- [ ] **Step 1: Add a failing root-font test and preserve shell characterization**

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

- [ ] **Step 2: Run RED and the shell baseline**

Run: `pnpm vitest run src/app/layout.test.tsx src/components/app-shell.test.tsx`

Expected: `layout.test.tsx` FAILS because the body lacks both font variable classes; `app-shell.test.tsx` PASSES.

- [ ] **Step 3: Register the approved fonts**

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

- [ ] **Step 4: Create the token file**

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

- [ ] **Step 5: Split the current stylesheet without visual changes**

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

- [ ] **Step 6: Add base reduced-motion and focus behavior**

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

- [ ] **Step 7: Verify the refactor**

Run: `pnpm vitest run src/components/app-shell.test.tsx src/features/home/presentation/scroll-video-hero.test.tsx && pnpm typecheck`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 8: Commit the foundation split**

```bash
git add src/app/layout.tsx src/app/layout.test.tsx src/app/globals.css src/styles src/components/app-shell.test.tsx
# User performs the commit later: refactor: establish cozy dark style foundation
```

