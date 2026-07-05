import { expect, test } from "@playwright/test";

test("unknown booking identifiers do not reveal private data", async ({ page }) => {
  const response = await page.goto("/booking/00000000-0000-4000-8000-000000000000/payment");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Tiền cọc 30%")) .toHaveCount(0);
});
