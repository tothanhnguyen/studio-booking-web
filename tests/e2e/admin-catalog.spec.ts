import { expect, test } from "@playwright/test";

test("admin edits a service and public catalog reflects the change", async ({ context, page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Mutation journey runs once on desktop.");
  await context.addCookies([
    { name: "mowstudio-test-role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/admin/services");

  const form = page.locator('form[data-service-slug="photo-room-rental"]');
  const nameInput = form.locator('input[name="name"]');
  const originalName = await nameInput.inputValue();
  const updatedName = `${originalName} — đã kiểm thử`;

  try {
    await nameInput.fill(updatedName);
    await form.getByRole("button", { name: "Lưu dịch vụ" }).click();
    await expect.poll(async () => (await (await page.request.get("/services/photo-room-rental")).text()).includes(updatedName)).toBe(true);

    await page.goto("/services/photo-room-rental");
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  } finally {
    await page.goto("/admin/services");
    const restoreForm = page.locator('form[data-service-slug="photo-room-rental"]');
    await restoreForm.locator('input[name="name"]').fill(originalName);
    await restoreForm.getByRole("button", { name: "Lưu dịch vụ" }).click();
    await expect.poll(async () => (await (await page.request.get("/services/photo-room-rental")).text()).includes(originalName)).toBe(true);
    await page.goto("/services/photo-room-rental");
    await expect(page.getByRole("heading", { name: originalName })).toBeVisible();
  }
});
