import { expect, test } from "@playwright/test";

test("login and registration surfaces expose password and Google flows", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tiếp tục với Google" })).toBeVisible();
  await page.getByRole("link", { name: "Đăng ký" }).click();
  await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
});

test("invalid auth callbacks return to login without an open redirect", async ({ page }) => {
  await page.goto("/auth/callback?next=https://evil.example");
  await expect(page).toHaveURL(/\/login\?error=callback$/);
});
