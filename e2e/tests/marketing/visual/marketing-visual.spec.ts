import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const pages = [
  { name: "homepage-desktop", path: "/", viewport: { width: 1440, height: 900 } },
  { name: "homepage-mobile", path: "/", viewport: { width: 375, height: 812 } },
  { name: "pricing-desktop", path: "/pricing", viewport: { width: 1440, height: 900 } },
  { name: "for-parents-desktop", path: "/for-parents", viewport: { width: 1440, height: 900 } },
  { name: "blog-desktop", path: "/blog", viewport: { width: 1440, height: 900 } },
  { name: "tutors-desktop", path: "/tutors", viewport: { width: 1440, height: 900 } },
];

for (const p of pages) {
  test(`visual baseline: ${p.name}`, async ({ page }) => {
    await page.setViewportSize(p.viewport);
    await page.goto(`${BASE_URL}${p.path}`);
    await page.waitForLoadState("networkidle");

    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toBeTruthy();
  });
}
