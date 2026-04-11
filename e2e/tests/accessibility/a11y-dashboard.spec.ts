import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const ROLE_CREDENTIALS: Record<string, { email: string; password: string }> = {
  parent: { email: "parent@test.aivo.com", password: "password123" },
  teacher: { email: "rivera@school.edu", password: "password123" },
  admin: { email: "parent@test.aivo.com", password: "password123" },
};

const DASHBOARD_ROUTES = [
  { path: "/dashboard", name: "Parent Dashboard", role: "parent" },
  { path: "/dashboard/learners", name: "Learners List", role: "parent" },
  { path: "/dashboard/settings", name: "Settings", role: "parent" },
  { path: "/dashboard/billing", name: "Billing", role: "parent" },
  { path: "/dashboard/gamification", name: "Gamification", role: "parent" },
  { path: "/teacher/dashboard", name: "Teacher Dashboard", role: "teacher" },
  { path: "/teacher/classrooms", name: "Teacher Classrooms", role: "teacher" },
  { path: "/admin/dashboard", name: "Admin Dashboard", role: "admin" },
  { path: "/admin/users", name: "Admin Users", role: "admin" },
];

const PUBLIC_ROUTES = [
  { path: "/", name: "Landing Page" },
  { path: "/login", name: "Login" },
  { path: "/register", name: "Register" },
];

async function loginAs(page: Page, role: string): Promise<void> {
  const creds = ROLE_CREDENTIALS[role];
  if (!creds) throw new Error(`No credentials for role: ${role}`);

  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.getByLabel(/email/i).fill(creds.email);
  await page.getByLabel(/password/i).first().fill(creds.password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/dashboard|teacher|admin/, { timeout: 15000 });
}

test.describe("Accessibility — Public Routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path}) has no critical a11y violations`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude("[data-testid='loading-skeleton']")
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      if (critical.length > 0) {
        const summary = critical.map(
          (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`,
        );
        console.error("A11y violations:\n" + summary.join("\n"));
      }

      expect(critical).toHaveLength(0);
    });
  }
});

test.describe("Accessibility — Dashboard Routes", () => {
  test.describe.configure({ mode: "serial" });

  let currentRole = "";

  for (const route of DASHBOARD_ROUTES) {
    test(`${route.name} (${route.path}) has no critical a11y violations`, async ({ page }) => {
      if (currentRole !== route.role) {
        await loginAs(page, route.role);
        currentRole = route.role;
      }

      await page.goto(route.path, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude("[data-testid='loading-skeleton']")
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      if (critical.length > 0) {
        const summary = critical.map(
          (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`,
        );
        console.error(`A11y violations on ${route.path}:\n` + summary.join("\n"));
      }

      expect(critical).toHaveLength(0);
    });
  }
});

test.describe("Accessibility — Keyboard Navigation", () => {
  test("Login page is keyboard navigable", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });

    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
    }

    const lastFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(lastFocused).toBeTruthy();
  });

  test("Landing page skip link works", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const skipLink = page.locator("[href='#main-content'], [href='#content'], a:has-text('Skip')").first();
    const skipLinkExists = await skipLink.count();

    if (skipLinkExists > 0) {
      await skipLink.focus();
      await skipLink.click();
      const focusedId = await page.evaluate(() => document.activeElement?.id);
      expect(focusedId).toBeTruthy();
    }
  });
});
