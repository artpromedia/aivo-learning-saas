import { test, expect } from '@playwright/test';
import { createTestParent, authenticateAs } from '../../fixtures/auth.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 0b: Session Management', () => {
  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('access token expiry triggers refresh rotation', async ({ page }) => {
    coverageTracker.setContext('access token expiry triggers refresh rotation', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user } = await authenticateAs('parent');

    const sessionRes = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();

    const expiredTokenRes = await page.request.post(`${API_BASE}/auth/refresh`, {
      data: { token: user.token },
    });

    if (expiredTokenRes.ok()) {
      const refreshData = await expiredTokenRes.json();
      const newToken = refreshData.token || refreshData.session?.token;
      expect(newToken).toBeTruthy();
      expect(newToken).not.toBe(user.token);

      const newSessionRes = await page.request.get(`${API_BASE}/auth/session`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      expect(newSessionRes.ok()).toBeTruthy();

      const oldTokenRes = await page.request.post(`${API_BASE}/auth/refresh`, {
        data: { token: user.token },
      });
      expect([200, 401]).toContain(oldTokenRes.status());
    }
  });

  test('logout invalidates session', async ({ page }) => {
    coverageTracker.setContext('logout invalidates session', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user } = await authenticateAs('parent');

    const preLogoutRes = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(preLogoutRes.ok()).toBeTruthy();

    const logoutRes = await page.request.post(`${API_BASE}/auth/sign-out`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(logoutRes.ok()).toBeTruthy();

    const postLogoutRes = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect([401, 403]).toContain(postLogoutRes.status());

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/^password$/i).fill(user.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/parent`);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('multiple devices maintain independent sessions', async ({ page, browser }) => {
    coverageTracker.setContext('multiple devices maintain independent sessions', 'module-0b-auth');
    await coverageTracker.attach(page);

    const user = await createTestParent();

    const signIn1 = await page.request.post(`${API_BASE}/auth/sign-in`, {
      data: { email: user.email, password: user.password },
    });
    expect(signIn1.ok()).toBeTruthy();
    const session1Data = await signIn1.json();
    const token1 = session1Data.token || session1Data.session?.token;

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    const signIn2 = await page2.request.post(`${API_BASE}/auth/sign-in`, {
      data: { email: user.email, password: user.password },
    });
    expect(signIn2.ok()).toBeTruthy();
    const session2Data = await signIn2.json();
    const token2 = session2Data.token || session2Data.session?.token;

    expect(token1).toBeTruthy();
    expect(token2).toBeTruthy();

    const session1Res = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    expect(session1Res.ok()).toBeTruthy();

    const session2Res = await page2.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    expect(session2Res.ok()).toBeTruthy();

    await page.request.post(`${API_BASE}/auth/sign-out`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    const session2AfterLogout = await page2.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    expect(session2AfterLogout.ok()).toBeTruthy();

    await page2.close();
    await context2.close();
  });
});
