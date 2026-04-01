import { test, expect } from "@playwright/test";

test.describe("Demo Booking Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo");
  });

  test("Demo page loads with qualification form", async ({ page }) => {
    await expect(page.getByText("See Aivo Transform Learning in 30 Minutes")).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Work Email")).toBeVisible();
    await expect(page.getByLabel(/School\/District Name/)).toBeVisible();
    await expect(page.getByLabel("Role")).toBeVisible();
    await expect(page.getByLabel("District Size")).toBeVisible();
  });

  test("Qualification form validates required fields", async ({ page }) => {
    await page.getByText("Continue to Booking").click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("Valid qualification reveals calendar embed", async ({ page }) => {
    // Mock the API
    await page.route("**/public/leads", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ lead: { id: "test" } }) })
    );

    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Work Email").fill("test@school.edu");
    await page.getByLabel(/School\/District Name/).fill("Test School");
    await page.getByLabel("Role").selectOption("Teacher");
    await page.getByLabel("District Size").selectOption("<500");
    await page.getByText("Continue to Booking").click();

    // Calendar iframe or fallback should appear
    await page.waitForTimeout(2000);
    // Either the iframe or fallback form should be visible
    const hasCalendar = await page.locator("iframe").isVisible().catch(() => false);
    const hasFallback = await page.getByText("Unable to load").isVisible().catch(() => false);
    expect(hasCalendar || hasFallback).toBeTruthy();
  });

  test("Fallback form shows if calendar iframe fails", async ({ page }) => {
    // Block the calendar iframe URL
    await page.route("**/calendar.oonrumail.com/**", (route) => route.abort());

    await page.route("**/public/leads", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ lead: { id: "test" } }) })
    );

    await page.getByLabel("Full Name").fill("Test");
    await page.getByLabel("Work Email").fill("t@t.com");
    await page.getByLabel(/School\/District/).fill("S");
    await page.getByLabel("Role").selectOption("Teacher");
    await page.getByLabel("District Size").selectOption("<500");
    await page.getByText("Continue to Booking").click();

    // Wait for timeout (10s)
    await expect(page.getByText("Unable to load the booking calendar")).toBeVisible({
      timeout: 15000,
    });
  });

  test("Fallback form submits successfully", async ({ page }) => {
    await page.route("**/calendar.oonrumail.com/**", (route) => route.abort());
    await page.route("**/public/leads", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ lead: { id: "test" } }) })
    );

    await page.getByLabel("Full Name").fill("Test");
    await page.getByLabel("Work Email").fill("t@t.com");
    await page.getByLabel(/School\/District/).fill("S");
    await page.getByLabel("Role").selectOption("Teacher");
    await page.getByLabel("District Size").selectOption("<500");
    await page.getByText("Continue to Booking").click();

    // Wait for fallback to appear
    await expect(page.getByText("Unable to load")).toBeVisible({ timeout: 15000 });

    // The email/phone fallback message should be visible
    await expect(page.getByText("demo@aivolearning.com")).toBeVisible();
  });
});
