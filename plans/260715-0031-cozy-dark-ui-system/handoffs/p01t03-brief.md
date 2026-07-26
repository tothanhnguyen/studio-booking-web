## Task 3: Complete responsive global navigation and footer

**Files:**
- Create: `src/components/site-footer.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/app-shell.test.tsx`
- Modify: `src/styles/shell.css`

**Interfaces:**
- `SiteFooter()` renders room links, booking CTA, and `Asia/Ho_Chi_Minh` context.
- AppShell continues accepting `{ actor, children, onSignOut }` unchanged.

- [ ] **Step 1: Write failing navigation/footer tests**

Add assertions for a mobile `<details>` menu and footer:

```tsx
expect(screen.getByText("Menu", { selector: "summary" })).toBeInTheDocument();
expect(screen.getByRole("contentinfo")).toHaveTextContent("Asia/Ho_Chi_Minh");
expect(screen.getByRole("link", { name: "Đặt lịch" })).toHaveAttribute("href", "/studios");
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm vitest run src/components/app-shell.test.tsx`

Expected: FAIL because mobile menu and footer do not exist.

- [ ] **Step 3: Implement `SiteFooter`**

Render a `footer.site-footer` with the MOW wordmark text, the existing three room links, a primary `/studios` booking link, and the line `Sài Gòn · Asia/Ho_Chi_Minh`.

- [ ] **Step 4: Add a no-JavaScript mobile menu**

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

- [ ] **Step 5: Add responsive shell styles**

Show `.site-mobile-menu` below 640px and `.site-nav` from 640px upward. Style the open panel with Ink/Espresso surfaces, Warm line borders, and at least 44px link targets. Make internal-page header sticky; preserve absolute overlay behavior when `#home-hero` exists.

- [ ] **Step 6: Verify navigation variants**

Run: `pnpm vitest run src/components/app-shell.test.tsx && pnpm typecheck`

Expected: PASS.

- [ ] **Step 7: Commit shared shell**

```bash
git add src/components/app-shell.tsx src/components/app-shell.test.tsx src/components/site-footer.tsx src/styles/shell.css
git commit -m "feat: add responsive site shell and footer"
```

## Phase 01 Gate

- [ ] Run `pnpm lint` and expect exit 0.
- [ ] Run `pnpm vitest run src/components src/features/home/presentation/scroll-video-hero.test.tsx` and expect PASS.
- [ ] Render `/` and `/studios` at 1440px and 375px; confirm the hero is visually unchanged and internal shell uses warm dark tokens.
