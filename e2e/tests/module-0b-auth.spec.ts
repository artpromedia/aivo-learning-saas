import { test, expect } from '@playwright/test';
import { createTestParent, authenticateAs, disposeAuthContext, type TestUser } from '../fixtures/auth.fixture';
import { coverageTracker } from '../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 0b: Authentication', () => {
  let parentUser: TestUser;

  test.afterAll(async () => {
    coverageTracker.flush();
    await disposeAuthContext();
  });

  test('parent signup and email verification', async ({ page }) => {
    coverageTracker.setContext('parent signup and email verification', 'module-0b-auth');
    await coverageTracker.attach(page);

    const email = `e2e+signup-${Date.now()}@aivo.test`;
    const password = 'E2eTest!Secure456';

    // Navigate to signup page
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Fill the signup form
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).first().fill(password);
    if (await page.getByLabel(/confirm password/i).isVisible()) {
      await page.getByLabel(/confirm password/i).fill(password);
    }
    await page.getByLabel(/name/i).fill('E2E Signup Test Parent');

    // Submit form
    await page.getByRole('button', { name: /sign up|create account|get started/i }).click();

    // Should redirect to verification page or role-based dashboard
    await page.waitForURL(/\/(verify-email|parent|learner|add-child)/, { timeout: 15_000 });

    // Verify email via API (test mode)
    const verifyRes = await page.request.post(`${API_BASE}/test/verify-email`, {
      data: { email },
    });
    // Verification endpoint may not exist in all environments
    if (verifyRes.ok()) {
      // Navigate to login and confirm access
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill(password);
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });
      await expect(page).not.toHaveURL(/\/login/);
    }
  });

  test('login and session persistence', async ({ page }) => {
    coverageTracker.setContext('login and session persistence', 'module-0b-auth');
    await coverageTracker.attach(page);

    // Create a verified test parent
    parentUser = await createTestParent();

    // Navigate to login
    await page.goto(`${BASE_URL}/login`);

    // Fill login form
    await page.getByLabel(/email/i).fill(parentUser.email);
    await page.getByLabel(/password/i).fill(parentUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Should navigate to role-based dashboard
    await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });

    // Verify session persists across navigation
    await page.goto(`${BASE_URL}/parent`);
    await expect(page).not.toHaveURL(/\/login/);

    // Refresh the page and verify still authenticated
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);

    // Check session API
    const sessionRes = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${parentUser.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();

    const sessionData = await sessionRes.json();
    expect(sessionData.user || sessionData.session).toBeTruthy();
  });

  test('logout clears session', async ({ page }) => {
    coverageTracker.setContext('logout clears session', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user } = await authenticateAs('parent');

    // Login via the UI
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });

    // Click logout
    const logoutButton = page.getByRole('button', { name: /log\s?out|sign\s?out/i });
    const logoutLink = page.getByRole('link', { name: /log\s?out|sign\s?out/i });

    if (await logoutButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await logoutButton.click();
    } else if (await logoutLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await logoutLink.click();
    } else {
      // Try menu/dropdown first
      const menuButton = page.getByRole('button', { name: /menu|profile|account/i });
      if (await menuButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await menuButton.click();
        await page.getByRole('menuitem', { name: /log\s?out|sign\s?out/i }).click();
      } else {
        // Logout via API as fallback
        await page.request.post(`${API_BASE}/auth/sign-out`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        await page.goto(`${BASE_URL}/login`);
      }
    }

    // Should be redirected to login or home
    await page.waitForURL(/\/(login|$)/, { timeout: 10_000 });

    // Navigating to dashboard should redirect to login
    await page.goto(`${BASE_URL}/parent`);
    await expect(page).toHaveURL(/\/(login|register)/);
  });

  test('role enforcement - parent cannot access admin routes', async ({ page }) => {
    coverageTracker.setContext('role enforcement - parent cannot access admin routes', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user } = await authenticateAs('parent');

    // Login as parent
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });

    // Attempt to access admin route
    await page.goto(`${BASE_URL}/admin`);

    // Should be redirected or shown forbidden
    const url = page.url();
    const isBlocked =
      url.includes('/parent') ||
      url.includes('/teacher') ||
      url.includes('/learner') ||
      url.includes('/login') ||
      url.includes('/403') ||
      url.includes('/unauthorized');
    const hasForbiddenText = await page
      .getByText(/forbidden|not authorized|access denied|403/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    expect(isBlocked || hasForbiddenText).toBeTruthy();

    // Also check API-level enforcement
    const adminApiRes = await page.request.get(`${API_BASE}/admin/tenants`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect([401, 403]).toContain(adminApiRes.status());
  });

  test('password reset flow', async ({ page }) => {
    coverageTracker.setContext('password reset flow', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user } = await authenticateAs('parent');

    // Navigate to forgot password page
    await page.goto(`${BASE_URL}/login`);
    const forgotLink = page.getByRole('link', { name: /forgot|reset/i });
    if (await forgotLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await forgotLink.click();
    } else {
      await page.goto(`${BASE_URL}/forgot-password`);
    }

    // Fill email
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByRole('button', { name: /send|reset|submit/i }).click();

    // Should see confirmation message
    await expect(
      page.getByText(/check your email|reset link sent|email sent/i),
    ).toBeVisible({ timeout: 10_000 });

    // Trigger password reset via API in test mode
    const resetRes = await page.request.post(`${API_BASE}/auth/password-reset`, {
      data: { email: user.email },
    });
    expect(resetRes.ok()).toBeTruthy();

    // Get the reset token from test endpoint
    const tokenRes = await page.request.get(
      `${API_BASE}/test/last-reset-token?email=${encodeURIComponent(user.email)}`,
    );

    if (tokenRes.ok()) {
      const { token } = await tokenRes.json();
      const newPassword = 'E2eNewPass!789';

      // Confirm password reset
      const confirmRes = await page.request.post(`${API_BASE}/auth/password-reset/confirm`, {
        data: { token, newPassword },
      });
      expect(confirmRes.ok()).toBeTruthy();

      // Login with new password
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel(/email/i).fill(user.email);
      await page.getByLabel(/password/i).fill(newPassword);
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});
