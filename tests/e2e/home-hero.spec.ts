import { expect, test } from "@playwright/test";

const POSTER_NAME = "Ba không gian Photo, Podcast và Music của MowStudio";

test("home hero renders HTML content and opens the studio catalog", async ({ page }) => {
  await page.goto("/");

  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(page.getByRole("heading", { name: "MOW STUDIO" })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 0.75)));
  }
  await expect(
    page.getByRole("heading", { name: "Nơi ý tưởng bước ra khỏi bản nháp." }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: POSTER_NAME })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  const highlights = page.getByRole("list", { name: "Không gian nổi bật" });
  await expect(highlights.getByText("Photo", { exact: true })).toBeVisible();
  await expect(highlights.getByText("Podcast", { exact: true })).toBeVisible();
  await expect(highlights.getByText("Music", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Đặt lịch" }).click();
  await expect(page).toHaveURL(/\/studios$/);
});

test("desktop maps the three scroll stops to selected canvas frames", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 768, "Desktop canvas only");
  await page.goto("/");

  const canvas = page.locator("canvas[data-hero-canvas]");
  const section = page.locator("[data-scroll-canvas-section]");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-frame-index", "0");
  await expect(section).toHaveAttribute("data-hero-snap-ready", "true");
  await expect(canvas).toHaveClass(/opacity-100/);

  const scrollToProgress = async (progress: number) => {
    await page.evaluate((targetProgress) => {
      const hero = document.querySelector<HTMLElement>("[data-scroll-canvas-section]");
      if (!hero) throw new Error("Hero section not found");
      const scrollRange = hero.offsetHeight - window.innerHeight;
      window.scrollTo(0, hero.offsetTop + scrollRange * targetProgress);
    }, progress);
  };

  const getScrollProgress = () =>
    page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>("[data-scroll-canvas-section]");
      if (!hero) throw new Error("Hero section not found");
      const scrollRange = hero.offsetHeight - window.innerHeight;
      return (window.scrollY - hero.offsetTop) / scrollRange;
    });

  await scrollToProgress(0.48);
  await expect(canvas).toHaveAttribute("data-frame-index", "32");
  await expect(section).toHaveAttribute("data-active-hero-state", "main");
  await expect.poll(getScrollProgress).toBeCloseTo(0.48, 2);

  await scrollToProgress(1);
  await expect(canvas).toHaveAttribute("data-frame-index", "56");
  await expect(section).toHaveAttribute("data-active-hero-state", "rooms");
  await expect.poll(getScrollProgress).toBeCloseTo(1, 2);
  await expect(page.getByRole("heading", { name: "Mỗi ý tưởng cần một không gian vừa vặn" })).toBeVisible();

  await scrollToProgress(0.48);
  await expect(canvas).toHaveAttribute("data-frame-index", "32");
  await expect(section).toHaveAttribute("data-active-hero-state", "main");
  await expect.poll(getScrollProgress).toBeCloseTo(0.48, 2);

  await scrollToProgress(0);
  await expect(canvas).toHaveAttribute("data-frame-index", "0");
  await expect(section).toHaveAttribute("data-active-hero-state", "brand");
  await expect.poll(getScrollProgress).toBeCloseTo(0, 2);
});

test("mobile uses poster only and never requests the desktop sequence", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 768, "Mobile fallback only");
  const sequenceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("hero-capsules-sequence")) {
      sequenceRequests.push(request.url());
    }
  });

  await page.goto("/");
  await expect(page.getByRole("img", { name: POSTER_NAME })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
  await page.waitForTimeout(300);

  expect(sequenceRequests).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  ).toBe(true);
  const stickyPosition = await page
    .locator("[data-scroll-canvas-section] > div")
    .evaluate((element) => window.getComputedStyle(element).position);
  expect(stickyPosition).not.toBe("sticky");
});

test("reduced motion keeps poster fallback and skips canvas assets", async ({ page }) => {
  const sequenceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("hero-capsules-sequence")) {
      sequenceRequests.push(request.url());
    }
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("img", { name: POSTER_NAME })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(sequenceRequests).toEqual([]);
});
