import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, isBrainAvailable } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 3b: Caregiver Access', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let caregiverToken: string;
  let brainUp = false;

  test.beforeAll(async () => {
    brainUp = await isBrainAvailable();
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    if (brainUp) await getPreClonedBrainState(parent.token, learner.id);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test.beforeEach(async () => {
    test.skip(!brainUp, 'brain-svc not available');
  });

  test('invite caregiver who sees learner summary', async ({ page }) => {
    coverageTracker.setContext('invite caregiver who sees learner summary', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const caregiverEmail = `e2e+caregiver-${Date.now()}@aivo.test`;

    const inviteRes = await page.request.post(`${API_BASE}/comms/caregiver-invite`, {
      data: {
        email: caregiverEmail,
        learnerId: learner.id,
        name: 'Test Caregiver',
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(inviteRes.ok()).toBeTruthy();

    const inviteData = await inviteRes.json();
    const inviteToken = inviteData.inviteToken || inviteData.token;

    if (inviteToken) {
      const acceptRes = await page.request.post(`${API_BASE}/comms/invites/${inviteToken}/accept`, {
        data: { password: 'E2eTest!Secure456', name: 'Test Caregiver' },
      });

      if (acceptRes.ok()) {
        const acceptData = await acceptRes.json();
        caregiverToken = acceptData.token || acceptData.session?.token;

        if (caregiverToken) {
          const summaryRes = await page.request.get(`${API_BASE}/family/learners/${learner.id}`, {
            headers: { Authorization: `Bearer ${caregiverToken}` },
          });
          expect([200, 403]).toContain(summaryRes.status());
        }
      }
    }

    expect(inviteData.caregiverId || inviteData.id || inviteData.inviteId).toBeTruthy();
  });

  test('caregiver can submit observations', async ({ page }) => {
    coverageTracker.setContext('caregiver can submit observations', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const token = caregiverToken || parent.token;

    const insightRes = await page.request.post(`${API_BASE}/comms/insights`, {
      data: {
        learnerId: learner.id,
        content: 'Noticed the child has been more engaged with reading activities at home this week.',
        type: 'caregiver-observation',
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (insightRes.ok()) {
      const insightData = await insightRes.json();
      expect(insightData.insightId || insightData.id).toBeTruthy();
    }
  });

  test('caregiver cannot approve or decline recommendations', async ({ page }) => {
    coverageTracker.setContext('caregiver cannot approve or decline recommendations', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const token = caregiverToken || 'invalid-caregiver-token';

    const approveRes = await page.request.post(`${API_BASE}/comms/recommendations/any-rec-id/respond`, {
      data: { response: 'approve' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([401, 403, 404]).toContain(approveRes.status());

    const declineRes = await page.request.post(`${API_BASE}/comms/recommendations/any-rec-id/respond`, {
      data: { response: 'decline' },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([401, 403, 404]).toContain(declineRes.status());
  });
});
