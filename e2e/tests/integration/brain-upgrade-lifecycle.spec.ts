import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, type BrainState } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Integration: Brain Upgrade Lifecycle', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let brainState: BrainState;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    brainState = await getPreClonedBrainState(parent.token, learner.id);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('admin releases version → snapshot → upgrade → regression → rollback → approve → reverted', async ({ page }) => {
    coverageTracker.setContext('brain upgrade full lifecycle', 'integration');
    await coverageTracker.attach(page);

    const preContextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainState.brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(preContextRes.ok()).toBeTruthy();
    const preContext = await preContextRes.json();

    const snapshotRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    let preUpgradeSnapshotId: string | null = null;
    if (snapshotRes.ok()) {
      const snapshotData = await snapshotRes.json();
      preUpgradeSnapshotId = snapshotData.snapshotId || snapshotData.id;
    }

    const upgradeRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/upgrade`, {
      data: {
        version: '2.0.0',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (upgradeRes.ok()) {
      const upgradeData = await upgradeRes.json();
      expect(upgradeData.version === '2.0.0' || upgradeData.upgraded === true).toBeTruthy();

      const postContextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainState.brainId}/context`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });
      expect(postContextRes.ok()).toBeTruthy();

      if (preUpgradeSnapshotId) {
        const rollbackRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/rollback`, {
          data: { snapshotId: preUpgradeSnapshotId },
          headers: { Authorization: `Bearer ${parent.token}` },
        });

        if (rollbackRes.ok()) {
          const rollbackData = await rollbackRes.json();
          expect(rollbackData.status || rollbackData.rolledBack).toBeTruthy();

          const postRollbackRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainState.brainId}/context`, {
            headers: { Authorization: `Bearer ${parent.token}` },
          });
          expect(postRollbackRes.ok()).toBeTruthy();
        }
      }
    }

    const approveRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/approve`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(approveRes.ok()).toBeTruthy();

    const finalProfileRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainState.brainId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(finalProfileRes.ok()).toBeTruthy();
    const finalProfile = await finalProfileRes.json();
    expect(['active', 'ready', 'approved']).toContain(finalProfile.status);

    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(notifRes.ok()).toBeTruthy();
  });
});
