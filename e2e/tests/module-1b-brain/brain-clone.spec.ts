import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { waitForBrainCloned } from '../../helpers/wait-for-nats';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 1b: Brain Clone', () => {
  let parent: TestUser;

  test.beforeAll(async () => {
    parent = await createTestParent();
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('assessment.baseline.completed triggers brain clone', async ({ page }) => {
    coverageTracker.setContext('assessment.baseline.completed triggers brain clone', 'module-1b-brain');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'below-grade' },
          { questionId: 'math-skills', answer: 'basic-operations' },
          { questionId: 'attention-span', answer: 'age-appropriate' },
          { questionId: 'motor-skills', answer: 'typical' },
        ],
        functioningLevel: 3,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();

    const brainResult = await waitForBrainCloned(parent.token, learner.id, { timeoutMs: 30_000 });
    expect(brainResult.brainId).toBeTruthy();
    expect(['ready', 'active']).toContain(brainResult.status);
  });

  test('brain state persisted with all assessment data', async ({ page }) => {
    coverageTracker.setContext('brain state persisted with all assessment data', 'module-1b-brain');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'below-grade' },
          { questionId: 'math-skills', answer: 'basic-operations' },
        ],
        functioningLevel: 3,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const brainResult = await waitForBrainCloned(parent.token, learner.id, { timeoutMs: 30_000 });

    const profileRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainResult.brainId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(profileRes.ok()).toBeTruthy();

    const profileData = await profileRes.json();
    expect(profileData.learnerId).toBe(learner.id);
    expect(profileData.domains || profileData.state).toBeTruthy();
  });

  test('initial snapshot created after brain clone', async ({ page }) => {
    coverageTracker.setContext('initial snapshot created after brain clone', 'module-1b-brain');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'below-grade' },
          { questionId: 'math-skills', answer: 'basic-operations' },
        ],
        functioningLevel: 3,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const brainResult = await waitForBrainCloned(parent.token, learner.id, { timeoutMs: 30_000 });

    const snapshotsRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainResult.brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (snapshotsRes.ok()) {
      const snapshotsData = await snapshotsRes.json();
      const snapshots = Array.isArray(snapshotsData) ? snapshotsData : snapshotsData.snapshots || [];
      expect(snapshots.length).toBeGreaterThanOrEqual(1);

      const initial = snapshots[0];
      expect(initial.id || initial.snapshotId).toBeTruthy();
    }
  });

  test('brain context API returns data after clone', async ({ page }) => {
    coverageTracker.setContext('brain context API returns data after clone', 'module-1b-brain');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'below-grade' },
          { questionId: 'math-skills', answer: 'basic-operations' },
        ],
        functioningLevel: 3,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const brainResult = await waitForBrainCloned(parent.token, learner.id, { timeoutMs: 30_000 });

    const contextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainResult.brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(contextRes.ok()).toBeTruthy();

    const contextData = await contextRes.json();
    expect(contextData).toBeTruthy();
    expect(contextData.learnerId || contextData.brainId).toBeTruthy();
  });
});
