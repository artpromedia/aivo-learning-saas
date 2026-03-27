import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", title: "AIVO Learning" },
  { path: "/pricing", title: "Pricing" },
  { path: "/for-parents", title: "For Parents" },
  { path: "/for-teachers", title: "For Teachers" },
  { path: "/for-districts", title: "For Districts" },
  { path: "/tutors", title: "AI Tutors" },
  { path: "/blog", title: "Blog" },
  { path: "/demo", title: "Request a Demo" },
  { path: "/contact", title: "Contact" },
  { path: "/faq", title: "FAQ" },
  { path: "/about", title: "About" },
  { path: "/legal/terms", title: "Terms of Service" },
  { path: "/legal/privacy", title: "Privacy Policy" },
];

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

for (const route of routes) {
  test(`SEO metadata: ${route.path}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${route.path}`);

    const title = await page.title();
    expect(title).toContain(route.title);

    const description = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute("content"),
    );
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(20);

    const ogTitle = await page.$eval(
      'meta[property="og:title"]',
      (el) => el.getAttribute("content"),
    ).catch(() => null);
    expect(ogTitle).toBeTruthy();
  });
}
