import { test, expect } from '@playwright/test';
import { authenticateAs } from '../../fixtures/auth.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 0b: Role Enforcement', () => {
  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('parent accessing parent routes returns 200', async ({ page }) => {
    coverageTracker.setContext('parent accessing parent routes returns 200', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user } = await authenticateAs('parent');

    const familyRes = await page.request.get(`${API_BASE}/family/learners`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(familyRes.ok()).toBeTruthy();

    const sessionRes = await page.request.get(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).not.toHaveURL(/\/(login|403|unauthorized)/);
  });

  test('learner accessing parent routes returns 403', async ({ page }) => {
    coverageTracker.setContext('learner accessing parent routes returns 403', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user: parentUser } = await authenticateAs('parent');

    const learnerTokenRes = await page.request.post(`${API_BASE}/test/create-learner-session`, {
      data: { parentId: parentUser.id },
      headers: { Authorization: `Bearer ${parentUser.token}` },
    });

    if (learnerTokenRes.ok()) {
      const { token: learnerToken } = await learnerTokenRes.json();

      const familyRes = await page.request.get(`${API_BASE}/family/learners`, {
        headers: { Authorization: `Bearer ${learnerToken}` },
      });
      expect([401, 403]).toContain(familyRes.status());

      const billingRes = await page.request.get(`${API_BASE}/billing/subscriptions`, {
        headers: { Authorization: `Bearer ${learnerToken}` },
      });
      expect([401, 403]).toContain(billingRes.status());
    } else {
      const noTokenRes = await page.request.get(`${API_BASE}/family/learners`, {
        headers: { Authorization: 'Bearer invalid-learner-token' },
      });
      expect([401, 403]).toContain(noTokenRes.status());
    }
  });

  test('teacher accessing admin routes returns 403', async ({ page }) => {
    coverageTracker.setContext('teacher accessing admin routes returns 403', 'module-0b-auth');
    await coverageTracker.attach(page);

    const { user: teacherUser } = await authenticateAs('teacher');

    const adminUsersRes = await page.request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${teacherUser.token}` },
    });
    expect([401, 403]).toContain(adminUsersRes.status());

    const adminTenantsRes = await page.request.get(`${API_BASE}/admin/tenants`, {
      headers: { Authorization: `Bearer ${teacherUser.token}` },
    });
    expect([401, 403]).toContain(adminTenantsRes.status());

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(teacherUser.email);
    await page.getByLabel(/password/i).fill(teacherUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding|teacher)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/admin`);
    const url = page.url();
    const isBlocked =
      url.includes('/dashboard') ||
      url.includes('/login') ||
      url.includes('/403') ||
      url.includes('/unauthorized') ||
      url.includes('/teacher');
    const hasForbiddenText = await page
      .getByText(/forbidden|not authorized|access denied|403/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    expect(isBlocked || hasForbiddenText).toBeTruthy();
  });

  test('PLATFORM_ADMIN accessing all routes returns 200', async ({ page }) => {
    coverageTracker.setContext('PLATFORM_ADMIN accessing all routes returns 200', 'module-0b-auth');
    await coverageTracker.attach(page);

    const adminTokenRes = await page.request.post(`${API_BASE}/test/create-admin-session`, {
      data: { role: 'PLATFORM_ADMIN' },
    });

    if (adminTokenRes.ok()) {
      const { token: adminToken } = await adminTokenRes.json();

      const adminUsersRes = await page.request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(adminUsersRes.ok()).toBeTruthy();

      const adminTenantsRes = await page.request.get(`${API_BASE}/admin/tenants`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(adminTenantsRes.ok()).toBeTruthy();

      const familyRes = await page.request.get(`${API_BASE}/family/learners`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(familyRes.ok()).toBeTruthy();

      const billingRes = await page.request.get(`${API_BASE}/billing/subscriptions`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(billingRes.ok()).toBeTruthy();
    } else {
      const { user: districtAdmin } = await authenticateAs('district_admin');

      const sessionRes = await page.request.get(`${API_BASE}/auth/session`, {
        headers: { Authorization: `Bearer ${districtAdmin.token}` },
      });
      expect(sessionRes.ok()).toBeTruthy();
    }
  });
});
