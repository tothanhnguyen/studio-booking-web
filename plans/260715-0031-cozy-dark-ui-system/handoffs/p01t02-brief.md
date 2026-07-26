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

- [ ] **Step 1: Write failing primitive tests**

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

- [ ] **Step 2: Run tests to confirm missing modules**

Run: `pnpm vitest run src/components/ui/page-heading.test.tsx src/components/ui/form-field.test.tsx src/components/ui/empty-state.test.tsx`

Expected: FAIL with module-not-found errors.

- [ ] **Step 3: Implement action variants**

Create `action.ts`:

```ts
export type ActionVariant = "primary" | "secondary" | "tertiary" | "danger";

export function actionClassName(variant: ActionVariant = "primary", compact = false) {
  return ["ui-action", `ui-action--${variant}`, compact ? "ui-action--compact" : ""].filter(Boolean).join(" ");
}
```

- [ ] **Step 4: Implement page, field, and empty-state components**

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

- [ ] **Step 5: Add primitive styles**

Implement `.ui-action`, `.page-heading`, `.page-eyebrow`, `.page-description`, `.ui-surface`, `.facts-rail`, and `.empty-state` in `utilities.css`. Implement `.ui-field` and native input/select/textarea states in `forms.css`. Primary actions use Champagne on Void; secondary actions use a Warm line border; danger actions use Clay without neon saturation.

- [ ] **Step 6: Run primitive tests**

Run: `pnpm vitest run src/components/ui`

Expected: PASS.

- [ ] **Step 7: Commit primitives**

```bash
git add src/components/ui src/styles/forms.css src/styles/utilities.css
git commit -m "feat: add shared UI presentation primitives"
```

