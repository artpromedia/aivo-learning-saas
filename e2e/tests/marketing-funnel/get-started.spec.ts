import { test, expect } from "@playwright/test";

test.describe("Get Started Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/public/leads", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ lead: { id: "test" } }) })
    );
  });

  test("Step 1 renders and validates fields", async ({ page }) => {
    await page.goto("/get-started");
    await expect(page.getByText("About You")).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();

    // Click continue without filling
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test("Complete flow: step 1 → 2 → 3 → success", async ({ page }) => {
    await page.goto("/get-started");

    // Step 1
    await page.getByLabel("Full Name").fill("Jane Smith");
    await page.getByLabel("Email").fill("jane@test.com");
    await page.getByLabel("Password").fill("SecurePass1!");
    await page.getByText("I confirm I am 13").click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2
    await expect(page.getByText("Your Learner")).toBeVisible();
    await page.getByLabel(/Learner.*First Name/).fill("Alex");
    await page.getByLabel("Grade Level").selectOption("5");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3
    await expect(page.getByText("Choose Your Plan")).toBeVisible();
    await page.getByRole("button", { name: "Create Free Account" }).click();

    // Success
    await expect(page.getByText("Welcome to Aivo!")).toBeVisible({ timeout: 5000 });
  });

  test("?plan=pro pre-selects Pro plan", async ({ page }) => {
    await page.goto("/get-started?plan=pro");

    // Complete step 1
    await page.getByLabel("Full Name").fill("J");
    await page.getByLabel("Email").fill("j@t.com");
    await page.getByLabel("Password").fill("LongPass1!");
    await page.getByText("I confirm I am 13").click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Complete step 2
    await page.getByLabel(/Learner.*First Name/).fill("A");
    await page.getByLabel("Grade Level").selectOption("3");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3 should show "Start 14-Day Free Trial"
    await expect(page.getByText("Start 14-Day Free Trial")).toBeVisible();
  });

  test("Back button preserves form data", async ({ page }) => {
    await page.goto("/get-started");

    // Step 1
    await page.getByLabel("Full Name").fill("Preserved Name");
    await page.getByLabel("Email").fill("p@t.com");
    await page.getByLabel("Password").fill("LongPass1!");
    await page.getByText("I confirm I am 13").click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Go back
    await page.getByRole("button", { name: "Back" }).click();

    // Data should be preserved
    await expect(page.getByLabel("Full Name")).toHaveValue("Preserved Name");
  });

  test("Password strength meter updates", async ({ page }) => {
    await page.goto("/get-started");

    await page.getByLabel("Password").fill("weak");
    await expect(page.getByText("Password strength: weak")).toBeVisible();

    await page.getByLabel("Password").fill("StrongPass1!");
    await expect(page.getByText("Password strength: strong")).toBeVisible();
  });
});
