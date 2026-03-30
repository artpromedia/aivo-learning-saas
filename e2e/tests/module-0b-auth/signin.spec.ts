import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 0b: Sign In', () => {
  let parentUser: TestUser;

  test.beforeAll(async () => {
    parentUser = await createTestParent();
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('valid credentials return JWT tokens', async ({ page }) => {
    coverageTracker.setContext('valid credentials return JWT tokens', 'module-0b-auth');
    await coverageTracker.attach(page);

    const signInRes = await page.request.post(`${API_BASE}/auth/sign-in`, {
      data: { email: parentUser.email, password: parentUser.password },
    });

    expect(signInRes.ok()).toBeTruthy();
    const data = await signInRes.json();

    const token = data.token || data.session?.token;
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    const parts = token.split('.');
    expect(parts.length).toBe(3);

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parentUser.email);
    await page.getByLabel(/password/i).first().fill(parentUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('invalid password returns 401', async ({ page }) => {
    coverageTracker.setContext('invalid password returns 401', 'module-0b-auth');
    await coverageTracker.attach(page);

    const res = await page.request.post(`${API_BASE}/auth/sign-in`, {
      data: { email: parentUser.email, password: 'WrongPassword!123' },
    });

    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.error || body.message).toBeTruthy();
  });

  test('non-existent email returns 401', async ({ page }) => {
    coverageTracker.setContext('non-existent email returns 401', 'module-0b-auth');
    await coverageTracker.attach(page);

    const res = await page.request.post(`${API_BASE}/auth/sign-in`, {
      data: { email: `nonexistent-${Date.now()}@aivo.test`, password: 'E2eTest!Secure456' },
    });

    expect(res.status()).toBe(401);
  });

  test('session persists across refresh', async ({ page }) => {
    coverageTracker.setContext('session persists across refresh', 'module-0b-auth');
    await coverageTracker.attach(page);

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parentUser.email);
    await page.getByLabel(/password/i).first().fill(parentUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|learner|teacher|admin|add-child)/, { timeout: 15_000 });

    const _urlBeforeRefresh = page.url();

    await page.reload();

    await expect(page).not.toHaveURL(/\/login/);

    await page.goto(`${BASE_URL}/parent`);
    await expect(page).not.toHaveURL(/\/login/);

    const sessionRes = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${parentUser.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();
  });
});
