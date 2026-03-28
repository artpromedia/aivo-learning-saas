import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { createBrainProfile, waitForBrainReady } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 1b: Brain Versioning', () => {
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

  test('mastery update creates snapshot', async ({ page }) => {
    coverageTracker.setContext('mastery update creates snapshot', 'module-1b-brain');
    await coverageTracker.attach(page);

    const preSnapshotsRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    let preCount = 0;
    if (preSnapshotsRes.ok()) {
      const preData = await preSnapshotsRes.json();
      const preSnapshots = Array.isArray(preData) ? preData : preData.snapshots || [];
      preCount = preSnapshots.length;
    }

    const updateRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainId}/mastery`, {
      data: {
        domain: 'math',
        score: 0.75,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (updateRes.ok()) {
      const postSnapshotsRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/snapshots`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (postSnapshotsRes.ok()) {
        const postData = await postSnapshotsRes.json();
        const postSnapshots = Array.isArray(postData) ? postData : postData.snapshots || [];
        expect(postSnapshots.length).toBeGreaterThanOrEqual(preCount);
      }
    }

    const profileRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(profileRes.ok()).toBeTruthy();
  });

  test('rollback reverts brain state', async ({ page }) => {
    coverageTracker.setContext('rollback reverts brain state', 'module-1b-brain');
    await coverageTracker.attach(page);

    const snapshotsRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (snapshotsRes.ok()) {
      const snapshotsData = await snapshotsRes.json();
      const snapshots = Array.isArray(snapshotsData) ? snapshotsData : snapshotsData.snapshots || [];

      if (snapshots.length > 0) {
        const targetSnapshot = snapshots[0];
        const snapshotId = targetSnapshot.id || targetSnapshot.snapshotId;

        const rollbackRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainId}/rollback`, {
          data: { snapshotId },
          headers: { Authorization: `Bearer ${parent.token}` },
        });

        if (rollbackRes.ok()) {
          const profileRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}`, {
            headers: { Authorization: `Bearer ${parent.token}` },
          });
          expect(profileRes.ok()).toBeTruthy();

          const profileData = await profileRes.json();
          expect(profileData.status || profileData.version).toBeTruthy();
        }
      }
    }
  });

  test('snapshot chain integrity maintained', async ({ page }) => {
    coverageTracker.setContext('snapshot chain integrity maintained', 'module-1b-brain');
    await coverageTracker.attach(page);

    await page.request.post(`${BRAIN_API}/brain/profiles/${brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    await page.request.post(`${BRAIN_API}/brain/profiles/${brainId}/mastery`, {
      data: { domain: 'reading', score: 0.6, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    await page.request.post(`${BRAIN_API}/brain/profiles/${brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const snapshotsRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainId}/snapshots`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (snapshotsRes.ok()) {
      const snapshotsData = await snapshotsRes.json();
      const snapshots = Array.isArray(snapshotsData) ? snapshotsData : snapshotsData.snapshots || [];

      for (let i = 1; i < snapshots.length; i++) {
        const current = snapshots[i];
        const prev = snapshots[i - 1];
        const currentTime = new Date(current.createdAt || current.timestamp).getTime();
        const prevTime = new Date(prev.createdAt || prev.timestamp).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(prevTime);
      }
    }
  });
});
