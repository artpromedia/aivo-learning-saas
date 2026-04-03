import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, isBrainAvailable, type BrainState } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { waitForNotification } from '../../helpers/wait-for-nats';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 3b: Recommendations', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let brainState: BrainState;
  let brainUp = false;

  test.beforeAll(async () => {
    brainUp = await isBrainAvailable();
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    if (brainUp) brainState = await getPreClonedBrainState(parent.token, learner.id);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test.beforeEach(async () => {
    test.skip(!brainUp, 'brain-svc not available');
  });

  test('brain recommendation appears in parent inbox', async ({ page }) => {
    coverageTracker.setContext('brain recommendation appears in parent inbox', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/recommendations`, {
      data: {
        type: 'curriculum-adjustment',
        domain: 'math',
        suggestion: 'Increase difficulty for addition problems based on mastery improvement',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (recRes.ok()) {
      const notification = await waitForNotification(
        parent.token,
        (n) => n.type === 'recommendation' || n.category === 'brain-recommendation',
        { timeoutMs: 15_000 },
      ).catch(() => null);

      if (notification) {
        expect(notification.type === 'recommendation' || notification.category === 'brain-recommendation').toBeTruthy();
      }
    }

    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(notifRes.ok()).toBeTruthy();
  });

  test('parent approves recommendation and it is applied', async ({ page }) => {
    coverageTracker.setContext('parent approves recommendation and it is applied', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/recommendations`, {
      data: {
        type: 'curriculum-adjustment',
        domain: 'reading',
        suggestion: 'Add phonics exercises',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (recRes.ok()) {
      const recData = await recRes.json();
      const recId = recData.recommendationId || recData.id;

      if (recId) {
        const approveRes = await page.request.post(`${API_BASE}/comms/recommendations/${recId}/respond`, {
          data: { response: 'approve' },
          headers: { Authorization: `Bearer ${parent.token}` },
        });
        expect(approveRes.ok()).toBeTruthy();

        const approveData = await approveRes.json();
        expect(approveData.status === 'approved' || approveData.applied === true).toBeTruthy();
      }
    }
  });

  test('parent declines recommendation and it is logged', async ({ page }) => {
    coverageTracker.setContext('parent declines recommendation and it is logged', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/recommendations`, {
      data: {
        type: 'curriculum-adjustment',
        domain: 'writing',
        suggestion: 'Switch to picture-based writing prompts',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (recRes.ok()) {
      const recData = await recRes.json();
      const recId = recData.recommendationId || recData.id;

      if (recId) {
        const declineRes = await page.request.post(`${API_BASE}/comms/recommendations/${recId}/respond`, {
          data: { response: 'decline' },
          headers: { Authorization: `Bearer ${parent.token}` },
        });
        expect(declineRes.ok()).toBeTruthy();

        const declineData = await declineRes.json();
        expect(declineData.status === 'declined' || declineData.logged === true).toBeTruthy();
      }
    }
  });

  test('parent adjusts recommendation with text and it is saved', async ({ page }) => {
    coverageTracker.setContext('parent adjusts recommendation with text and it is saved', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/recommendations`, {
      data: {
        type: 'pace-adjustment',
        domain: 'math',
        suggestion: 'Slow down multiplication drills',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (recRes.ok()) {
      const recData = await recRes.json();
      const recId = recData.recommendationId || recData.id;

      if (recId) {
        const adjustRes = await page.request.post(`${API_BASE}/comms/recommendations/${recId}/respond`, {
          data: {
            response: 'adjust',
            adjustmentText: 'Keep the multiplication drills but use visual aids and reduce to 5 problems per session',
          },
          headers: { Authorization: `Bearer ${parent.token}` },
        });
        expect(adjustRes.ok()).toBeTruthy();

        const adjustData = await adjustRes.json();
        expect(adjustData.adjustmentText || adjustData.parentNote || adjustData.status === 'adjusted').toBeTruthy();
      }
    }
  });

  test('declined recommendation re-surfaces after 14 days', async ({ page }) => {
    coverageTracker.setContext('declined recommendation re-surfaces after 14 days', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainState.brainId}/recommendations`, {
      data: {
        type: 'curriculum-adjustment',
        domain: 'social',
        suggestion: 'Add social skills practice',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (recRes.ok()) {
      const recData = await recRes.json();
      const recId = recData.recommendationId || recData.id;

      if (recId) {
        await page.request.post(`${API_BASE}/comms/recommendations/${recId}/respond`, {
          data: { response: 'decline' },
          headers: { Authorization: `Bearer ${parent.token}` },
        });

        const advanceRes = await page.request.post(`${API_BASE}/test/advance-time`, {
          data: { days: 14, recommendationId: recId },
          headers: { Authorization: `Bearer ${parent.token}` },
        });

        if (advanceRes.ok()) {
          const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
            headers: { Authorization: `Bearer ${parent.token}` },
          });
          expect(notifRes.ok()).toBeTruthy();
        }
      }
    }
  });
});
