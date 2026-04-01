import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Hero loads with headline, CTAs, and slide carousel", async ({ page }) => {
    await expect(page.getByText("AI That Learns How Your Child Learns")).toBeVisible();
    await expect(page.getByTestId("hero-cta-primary")).toBeVisible();
    await expect(page.getByTestId("hero-cta-secondary")).toBeVisible();
    await expect(page.getByTestId("hero-cta-demo")).toBeVisible();
    await expect(page.getByTestId("hero-slide-dots")).toBeVisible();
  });

  test("Social proof bar shows logos", async ({ page }) => {
    await expect(page.getByText("Trusted by 500+ schools across 12 states")).toBeVisible();
    await expect(page.getByText("Springfield USD").first()).toBeVisible();
  });

  test("Walkthrough player starts and progresses through scenes", async ({ page }) => {
    const player = page.getByRole("region", { name: "Aivo product walkthrough" });
    await expect(player).toBeVisible();

    // Click play if overlay is present
    const playOverlay = page.getByLabel("Play walkthrough");
    if (await playOverlay.isVisible()) {
      await playOverlay.click();
    }

    // Verify scene 1 content appears
    await expect(page.getByText("AJ")).toBeVisible({ timeout: 10000 });
  });

  test("Stats counters animate when scrolled into view", async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector('[class*="stats"]')?.scrollIntoView();
    });

    // Wait for stats to be visible
    await expect(page.getByText("Schools")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Students")).toBeVisible();
  });

  test("Testimonials carousel navigates", async ({ page }) => {
    // Scroll to testimonials
    await page.getByText("What People Are Saying").scrollIntoViewIfNeeded();
    await expect(page.getByText("What People Are Saying")).toBeVisible();

    // Click next
    await page.getByLabel("Next testimonials").click();

    // Should show different testimonials
    await expect(page.getByText("David Thompson")).toBeVisible({ timeout: 5000 });
  });

  test("Bottom CTA band links work", async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);

    // Should find CTA links at bottom
    const getStartedLinks = page.getByRole("link", { name: /Start Free|Get Started/ });
    expect(await getStartedLinks.count()).toBeGreaterThan(0);
  });

  test("Floating demo CTA appears after 15 seconds", async ({ page }) => {
    // Initially not visible
    await expect(page.getByText("Book a Demo").first()).not.toBeVisible();

    // Fast-forward via scroll (50% scroll depth triggers it)
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);

    // Or wait 15s
    await page.waitForTimeout(15000);

    await expect(page.getByText("Book a Demo").first()).toBeVisible({ timeout: 5000 });
  });
});
