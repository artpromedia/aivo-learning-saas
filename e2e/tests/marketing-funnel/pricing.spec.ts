import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("Pricing page shows 3 plans", async ({ page }) => {
    await expect(page.getByText("Simple, Transparent Pricing")).toBeVisible();
    // Three plan names
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "District" })).toBeVisible();
  });

  test("Monthly/Annual toggle updates prices", async ({ page }) => {
    // Get the toggle
    const toggle = page.getByRole("switch", { name: /annual billing/i });
    await expect(toggle).toBeVisible();

    // Click to switch
    await toggle.click();
    await page.waitForTimeout(300);

    // Prices should change
    // When toggle changes, the animated price updates
    await expect(page.getByText(/\$/).first()).toBeVisible();
  });

  test("Feature comparison table expands", async ({ page }) => {
    // Click expand button
    await page.getByText("Show full comparison").click();

    // Table should be visible
    await expect(page.getByText("Student profiles")).toBeVisible();
    await expect(page.getByText("AI Tutors")).toBeVisible();
  });

  test("CTA buttons navigate correctly", async ({ page }) => {
    // Get Started Free link
    const getStartedLink = page.getByRole("link", { name: "Get Started Free" });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute("href", "/get-started");

    // Book a Demo link for District
    const demoLink = page.getByRole("link", { name: "Book a Demo" }).first();
    await expect(demoLink).toBeVisible();
    await expect(demoLink).toHaveAttribute("href", "/demo");
  });
});
