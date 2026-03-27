import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/pricing",
  "/for-parents",
  "/for-teachers",
  "/for-districts",
  "/tutors",
  "/blog",
  "/demo",
  "/contact",
  "/faq",
  "/about",
  "/help",
  "/careers",
  "/partners",
  "/legal",
  "/legal/terms",
  "/legal/privacy",
  "/accessibility",
  "/cookies",
];

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

for (const route of routes) {
  test(`accessibility audit: ${route}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${route}`);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(
      critical,
      `Found ${critical.length} critical/serious violations on ${route}:\n${critical.map((v) => `- ${v.id}: ${v.description} (${v.nodes.length} instances)`).join("\n")}`,
    ).toHaveLength(0);
  });
}
