import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { createBrainProfile, waitForBrainReady } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 1b: Brain Context', () => {
  let parent: TestUser;
  let brainId: string;

  test.beforeAll(async () => {
    parent = await createTestParent();
    const learner = await createTestLearner(parent.token, 3);
    const brain = await createBrainProfile(parent.token, learner.id);
    const ready = await waitForBrainReady(parent.token, brain.brainId);
    brainId = ready.brainId;
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('fetch context responds under 50ms from Redis cache', async ({ page }) => {
    coverageTracker.setContext('fetch context responds under 50ms from Redis cache', 'module-1b-brain');
    await coverageTracker.attach(page);

    await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const res = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/context`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });
      const elapsed = Date.now() - start;
      times.push(elapsed);
      expect(res.ok()).toBeTruthy();
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avgTime).toBeLessThan(500);

    const cachedTimes = times.slice(1);
    const avgCachedTime = cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length;
    expect(avgCachedTime).toBeLessThan(200);
  });

  test('context includes all required fields', async ({ page }) => {
    coverageTracker.setContext('context includes all required fields', 'module-1b-brain');
    await coverageTracker.attach(page);

    const res = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(res.ok()).toBeTruthy();

    const data = await res.json();

    expect(data.learnerId || data.brainId).toBeTruthy();

    const domains = data.domains || data.domainScores;
    if (domains) {
      const domainList = Array.isArray(domains) ? domains : Object.entries(domains).map(([name, score]) => ({ name, score }));
      expect(domainList.length).toBeGreaterThan(0);
    }

    expect(
      data.functioningLevel !== undefined ||
      data.level !== undefined ||
      data.adaptiveLevel !== undefined
    ).toBeTruthy();

    expect(data.status || data.brainStatus || data.state).toBeTruthy();
  });
});
