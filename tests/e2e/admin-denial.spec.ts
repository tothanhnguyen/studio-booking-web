import { expect, test } from "@playwright/test";

test("guest is redirected before admin content is rendered", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?next=\/admin$/);
  await expect(page.getByRole("heading", { name: "Tổng quan quản trị" })).toHaveCount(0);
});

test("customer cannot render admin content", async ({ context, page }) => {
  await context.addCookies([
    { name: "mowstudio-test-role", value: "CUSTOMER", domain: "127.0.0.1", path: "/" },
  ]);

  const response = await page.goto("/admin");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Tổng quan quản trị" })).toHaveCount(0);
});

test("admin can render the protected shell", async ({ context, page }) => {
  await context.addCookies([
    { name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
  ]);

  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Tổng quan quản trị" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Điều hướng quản trị" })).toBeVisible();
});
