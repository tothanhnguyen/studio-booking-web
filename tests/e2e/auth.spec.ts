import { expect, test } from "@playwright/test";

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
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

  await context.addCookies([
    { name: "mowstudio-test-role", value: "CUSTOMER", domain: "127.0.0.1", path: "/" },
  ]);
  await page.reload();
  await expect(page.getByRole("link", { name: "Booking của tôi" })).toBeVisible();
  await expect(page.getByText("customer-test@mowstudio.local")).toBeVisible();

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
});

test("header links admin sessions to management", async ({ context, page }) => {
  await context.addCookies([
    { name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Quản trị" })).toHaveAttribute("href", "/admin");
});
