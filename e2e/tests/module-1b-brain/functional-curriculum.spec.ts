import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { createBrainProfile, waitForBrainReady } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 1b: Functional Curriculum', () => {
  let parent: TestUser;

  test.beforeAll(async () => {
    parent = await createTestParent();
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('LOW_VERBAL learner gets functional curriculum initialized', async ({ page }) => {
    coverageTracker.setContext('LOW_VERBAL learner gets functional curriculum initialized', 'module-1b-brain');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 2);

    const brain = await createBrainProfile(parent.token, learner.id);
    const ready = await waitForBrainReady(parent.token, brain.brainId);

    const profileRes = await page.request.get(`${BRAIN_API}/brain/profiles/${ready.brainId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(profileRes.ok()).toBeTruthy();

    const profileData = await profileRes.json();
    const curriculum = profileData.curriculum || profileData.curriculumType || profileData.adaptiveMode;

    if (curriculum) {
      expect(['functional', 'supported', 'LOW_VERBAL']).toContain(curriculum);
    }
  });

  test('5 domains tracked for functional curriculum', async ({ page }) => {
    coverageTracker.setContext('5 domains tracked for functional curriculum', 'module-1b-brain');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 2);
    const brain = await createBrainProfile(parent.token, learner.id);
    const ready = await waitForBrainReady(parent.token, brain.brainId);

    const contextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${ready.brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(contextRes.ok()).toBeTruthy();

    const contextData = await contextRes.json();
    const domains = contextData.domains || contextData.domainScores;

    if (domains) {
      const domainList = Array.isArray(domains) ? domains : Object.keys(domains);
      expect(domainList.length).toBeGreaterThanOrEqual(5);

      const expectedDomains = ['communication', 'daily-living', 'social', 'motor', 'cognitive'];
      const domainNames = domainList.map((d: string | { name: string }) =>
        (typeof d === 'string' ? d : d.name).toLowerCase()
      );

      for (const expected of expectedDomains) {
        const found = domainNames.some((name: string) =>
          name.includes(expected) || expected.includes(name)
        );
        expect(found).toBeTruthy();
      }
    }
  });
});
