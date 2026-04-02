import { test, expect, type Page } from "@playwright/test";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Open the LocaleSwitcher dropdown and click the target locale. */
async function switchLocale(page: Page, localeLabel: string) {
  const globeBtn = page.getByLabel("Change language");
  await globeBtn.click();

  const dropdown = page.locator(".absolute.right-0.top-full");
  await expect(dropdown).toBeVisible();

  await dropdown.getByText(localeLabel, { exact: true }).click();

  // The component calls window.location.reload(), so wait for navigation.
  await page.waitForLoadState("domcontentloaded");
}

/** Read the NEXT_LOCALE cookie value from the browser context. */
async function getLocaleCookie(page: Page): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === "NEXT_LOCALE")?.value;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

test.describe("i18n — Locale Switching", () => {
  test.beforeEach(async ({ page }) => {
    // Clear locale cookie so every test starts from English default.
    await page.context().clearCookies();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  /* ---- Default locale is English ---- */

  test("default locale is English", async ({ page }) => {
    // Title contains "AIVO" or the site name
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Nav link shows "Features"
    await expect(page.getByRole("link", { name: "Features" }).first()).toBeVisible();

    // Hero headline is in English
    await expect(
      page.getByText("AI-Powered Learning That Adapts to Every Student"),
    ).toBeVisible();

    // HTML lang is "en" by default
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  /* ---- Switching to Spanish ---- */

  test("switch to Spanish — UI updates to Spanish strings", async ({ page }) => {
    await switchLocale(page, "Español");

    // Nav shows Spanish label "Funciones" instead of "Features"
    await expect(page.getByRole("link", { name: "Funciones" }).first()).toBeVisible({
      timeout: 10_000,
    });

    // Hero headline is in Spanish
    await expect(
      page.getByText("Aprendizaje con IA que se Adapta a Cada Estudiante"),
    ).toBeVisible({ timeout: 10_000 });

    // CTA button text is "Empezar Gratis"
    await expect(page.getByText("Empezar Gratis").first()).toBeVisible();

    // Cookie is set
    expect(await getLocaleCookie(page)).toBe("es");
  });

  /* ---- Switching to Arabic ---- */

  test("switch to Arabic — RTL and Arabic content", async ({ page }) => {
    await switchLocale(page, "العربية");

    // Wait for Arabic content to load
    await expect(
      page.getByText("تعليم بالذكاء الاصطناعي يتكيف مع كل طالب"),
    ).toBeVisible({ timeout: 10_000 });

    // dir="rtl" is set on <html>
    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    // lang="ar" is set on <html>
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("ar");

    // Nav displays Arabic strings
    await expect(page.getByRole("link", { name: "المميزات" }).first()).toBeVisible();

    // Cookie is correctly set
    expect(await getLocaleCookie(page)).toBe("ar");
  });

  test("Arabic layout — logo appears on the right side of the nav", async ({ page }) => {
    await switchLocale(page, "العربية");

    await page.waitForLoadState("domcontentloaded");

    // The nav logo should be repositioned for RTL.
    // Check that the computed direction of the nav header is rtl.
    const navDir = await page.locator("header").evaluate(
      (el) => getComputedStyle(el).direction,
    );
    expect(navDir).toBe("rtl");
  });

  /* ---- Locale persistence ---- */

  test("locale persists across navigation", async ({ page }) => {
    // Switch to French
    await switchLocale(page, "Français");

    await expect(
      page.getByText("L'Apprentissage par IA qui s'Adapte à Chaque Élève"),
    ).toBeVisible({ timeout: 10_000 });

    // Navigate to /pricing
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");

    // Verify French nav link is still present
    await expect(
      page.getByRole("link", { name: "Fonctionnalités" }).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Navigate back to /
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Still French
    await expect(
      page.getByText("L'Apprentissage par IA qui s'Adapte à Chaque Élève"),
    ).toBeVisible({ timeout: 10_000 });
  });

  /* ---- Switching to Chinese ---- */

  test("switch to Chinese — Chinese characters in hero", async ({ page }) => {
    await switchLocale(page, "中文");

    // Hero headline in Chinese
    await expect(
      page.getByText("适应每个学生的AI学习"),
    ).toBeVisible({ timeout: 10_000 });

    // CTA in Chinese
    await expect(page.getByText("免费开始").first()).toBeVisible();

    // Cookie is set
    expect(await getLocaleCookie(page)).toBe("zh");
  });

  /* ---- Switch back to English ---- */

  test("switch back to English from another locale", async ({ page }) => {
    // First switch to Spanish
    await switchLocale(page, "Español");
    await expect(page.getByText("Funciones").first()).toBeVisible({ timeout: 10_000 });

    // Now switch back to English
    await switchLocale(page, "English");

    await expect(
      page.getByText("AI-Powered Learning That Adapts to Every Student"),
    ).toBeVisible({ timeout: 10_000 });

    // Nav link is back to English
    await expect(page.getByRole("link", { name: "Features" }).first()).toBeVisible();

    expect(await getLocaleCookie(page)).toBe("en");
  });

  /* ---- All 10 locales available ---- */

  test("LocaleSwitcher dropdown lists all 10 locales", async ({ page }) => {
    const globeBtn = page.getByLabel("Change language");
    await globeBtn.click();

    const dropdown = page.locator(".absolute.right-0.top-full");
    await expect(dropdown).toBeVisible();

    const expectedLabels = [
      "English",
      "Español",
      "Français",
      "العربية",
      "中文",
      "Português",
      "Kiswahili",
      "Asụsụ Igbo",
      "Èdè Yorùbá",
      "Hausa",
    ];

    for (const label of expectedLabels) {
      await expect(dropdown.getByText(label, { exact: true })).toBeVisible();
    }

    // Confirm exactly 10 locale buttons
    const buttons = dropdown.locator("button");
    await expect(buttons).toHaveCount(10);
  });

  /* ---- Cookie is set correctly ---- */

  test("NEXT_LOCALE cookie is set with correct value after switching", async ({ page }) => {
    const locales = [
      { label: "Español", code: "es" },
      { label: "Français", code: "fr" },
      { label: "العربية", code: "ar" },
      { label: "中文", code: "zh" },
      { label: "Português", code: "pt" },
    ];

    for (const { label, code } of locales) {
      await switchLocale(page, label);
      const cookieVal = await getLocaleCookie(page);
      expect(cookieVal, `Expected NEXT_LOCALE=${code} after selecting ${label}`).toBe(code);
    }
  });
});
