import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("Pricing page shows 4 plans", async ({ page }) => {
    await expect(page.getByText("Simple, transparent pricing")).toBeVisible();
    // Four plan names
    await expect(page.getByRole("heading", { name: "Starter" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Family" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Premium" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enterprise" })).toBeVisible();
  });

  test("Monthly/Annual toggle updates prices", async ({ page }) => {
    // Default is annual — verify annual prices
    await expect(page.getByText("$15.99")).toBeVisible();
    await expect(page.getByText("$23.99")).toBeVisible();
    await expect(page.getByText("$31.99")).toBeVisible();

    // Toggle to monthly
    const toggle = page.getByRole("switch", { name: /annual billing/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await page.waitForTimeout(300);

    // Verify monthly prices
    await expect(page.getByText("$19.99")).toBeVisible();
    await expect(page.getByText("$29.99")).toBeVisible();
    await expect(page.getByText("$39.99")).toBeVisible();
  });

  test("Enterprise card shows Contact Sales instead of price", async ({ page }) => {
    await expect(page.getByText("Contact Us")).toBeVisible();
  });

  test("Enterprise CTA links to /demo", async ({ page }) => {
    const enterpriseCtaLink = page.getByRole("link", { name: "Contact Sales" });
    await expect(enterpriseCtaLink).toBeVisible();
    await expect(enterpriseCtaLink).toHaveAttribute("href", "/demo");
  });

  test("Feature comparison table is visible", async ({ page }) => {
    await expect(page.getByText("Compare Plans")).toBeVisible();
    await expect(page.getByText("Student profiles")).toBeVisible();
  });

  test("CTA buttons navigate correctly", async ({ page }) => {
    // Get Started link for Starter
    const getStartedLink = page.getByRole("link", { name: "Get Started" });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute("href", "/get-started");

    // Contact Sales link for Enterprise → /demo
    const demoLink = page.getByRole("link", { name: "Contact Sales" });
    await expect(demoLink).toBeVisible();
    await expect(demoLink).toHaveAttribute("href", "/demo");
  });

  test("Family plan is marked as Most Popular", async ({ page }) => {
    await expect(page.getByText("Most Popular")).toBeVisible();
  });
});
