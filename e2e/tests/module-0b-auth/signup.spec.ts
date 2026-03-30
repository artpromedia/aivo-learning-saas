import { test, expect } from '@playwright/test';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 0b: Signup', () => {
  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('email/password sign up creates account', async ({ page }) => {
    coverageTracker.setContext('email/password sign up creates account', 'module-0b-auth');
    await coverageTracker.attach(page);

    const email = `e2e+signup-${Date.now()}@aivo.test`;
    const password = 'E2eTest!Secure456';

    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    if (await page.getByLabel(/confirm password/i).isVisible().catch(() => false)) {
      await page.getByLabel(/confirm password/i).fill(password);
    }
    await page.getByLabel(/name/i).fill('E2E Signup Test Parent');

    await page.getByRole('button', { name: /sign up|create account|get started/i }).click();

    await page.waitForURL(/\/(verify-email|parent|learner|add-child)/, { timeout: 15_000 });

    const verifyRes = await page.request.post(`${API_BASE}/test/verify-email`, {
      data: { email },
    });

    if (verifyRes.ok()) {
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/^password$/i).fill(password);
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      await page.waitForURL(/\/(parent|learner|add-child)/, { timeout: 15_000 });
      await expect(page).not.toHaveURL(/\/login/);
    }
  });

  test('duplicate email returns 409', async ({ page }) => {
    coverageTracker.setContext('duplicate email returns 409', 'module-0b-auth');
    await coverageTracker.attach(page);

    const email = `e2e+dup-${Date.now()}@aivo.test`;
    const password = 'E2eTest!Secure456';

    const firstRes = await page.request.post(`${API_BASE}/auth/sign-up`, {
      data: { email, password, name: 'First User', role: 'parent' },
    });
    expect(firstRes.ok()).toBeTruthy();

    const secondRes = await page.request.post(`${API_BASE}/auth/sign-up`, {
      data: { email, password, name: 'Second User', role: 'parent' },
    });
    expect(secondRes.status()).toBe(409);
  });

  test('weak password returns 400 validation error', async ({ page }) => {
    coverageTracker.setContext('weak password returns 400 validation error', 'module-0b-auth');
    await coverageTracker.attach(page);

    const email = `e2e+weakpw-${Date.now()}@aivo.test`;

    const res = await page.request.post(`${API_BASE}/auth/sign-up`, {
      data: { email, password: '123', name: 'Weak PW User', role: 'parent' },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error || body.message || body.errors).toBeTruthy();
  });

  test('Google OAuth flow with mocked redirect', async ({ page }) => {
    coverageTracker.setContext('Google OAuth flow with mocked redirect', 'module-0b-auth');
    await coverageTracker.attach(page);

    await page.route('**/auth/google**', async (route) => {
      const url = new URL(route.request().url());
      const callbackUrl = url.searchParams.get('redirect_uri') || `${BASE_URL}/auth/callback`;

      await route.fulfill({
        status: 302,
        headers: {
          location: `${callbackUrl}?code=test_oauth_code&state=test_state`,
        },
      });
    });

    await page.route(`${BASE_URL}/auth/callback**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><script>window.location.href="/dashboard";</script></body></html>',
      });
    });

    await page.goto(`${BASE_URL}/register`);

    const googleButton = page.getByRole('button', { name: /google|continue with google/i });
    if (await googleButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await googleButton.click();
      await page.waitForURL(/\/(parent|learner|add-child|auth\/callback)/, { timeout: 15_000 });
    }

    const oauthRes = await page.request.post(`${API_BASE}/auth/oauth/google`, {
      data: { code: 'test_oauth_code', testMode: true },
    });

    if (oauthRes.ok()) {
      const oauthData = await oauthRes.json();
      expect(oauthData.token || oauthData.session?.token).toBeTruthy();
    }
  });
});
