import { expect, type Page, test } from "@playwright/test";

// The header renders two nav variants simultaneously (src/components/app-shell.tsx): a desktop
// <nav> shown via CSS at >=640px, and a mobile variant nested inside a closed <details>/<summary>
// disclosure. A closed <details> hides its children from the accessibility tree entirely (not
// just visually), so on narrow (mobile-chrome) viewports the nav links aren't reachable via
// getByRole/getByText until the "Menu" disclosure is opened. On wide (chromium) viewports the
// disclosure itself is CSS-hidden, so this is a no-op there.
async function openMobileMenuIfPresent(page: Page) {
  const mobileMenu = page.locator("details.site-mobile-menu");
  const mobileMenuToggle = mobileMenu.locator("summary");
  // Wait (briefly) for the toggle to become visible rather than checking isVisible() once —
  // right after a navigation (e.g. the logout form submit below), the DOM may not have painted
  // yet at the instant of an unconditional check. On desktop viewports the toggle is
  // permanently CSS-hidden, so this simply times out and the catch skips the click.
  const isMobileViewport = await mobileMenuToggle
    .waitFor({ state: "visible", timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (!isMobileViewport) return;
  // The logout form submit below re-renders the header in place (the <details> node isn't
  // remounted), so a menu opened earlier in the test can still be open here. Only click the
  // toggle when it's actually closed — clicking an already-open <details> would collapse it.
  const isAlreadyOpen = await mobileMenu.evaluate((el) => (el as HTMLDetailsElement).open);
  if (!isAlreadyOpen) {
    await mobileMenuToggle.click();
  }
}

test("login and registration surfaces expose password and Google flows", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tiếp tục với Google" })).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Đăng ký" }).click();
  await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
});

test("invalid auth callbacks return to login without an open redirect", async ({ page }) => {
  await page.goto("/auth/callback?next=https://evil.example");
  await expect(page).toHaveURL(/\/login\?error=callback$/);
});

test("header reflects customer session and logout", async ({ context, page }) => {
  await page.goto("/");
  await openMobileMenuIfPresent(page);
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

  await context.addCookies([
    { name: "mowstudio-test-role", value: "CUSTOMER", domain: "127.0.0.1", path: "/" },
  ]);
  await page.reload();
  await openMobileMenuIfPresent(page);
  await expect(page.getByRole("link", { name: "Booking của tôi" })).toBeVisible();
  // getByText() matches raw DOM text regardless of CSS visibility or a closed <details>, so it
  // always finds both the desktop and mobile nav's email span. The `:visible` pseudo-class
  // scopes to whichever one is actually rendered for the current viewport.
  await expect(page.locator(".site-nav-email:visible")).toHaveText(
    "customer-test@mowstudio.local",
  );

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL("/");
  await openMobileMenuIfPresent(page);
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
});

test("header links admin sessions to management", async ({ context, page }) => {
  await context.addCookies([
    { name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/");
  await openMobileMenuIfPresent(page);
  await expect(page.getByRole("link", { name: "Quản trị" })).toHaveAttribute("href", "/admin");
});
