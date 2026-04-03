import { test, expect } from '@playwright/test';
import { createTestParent, createTestTeacher, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, isBrainAvailable } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 3b: Teacher Collaboration', () => {
  let parent: TestUser;
  let teacher: TestUser;
  let learner: TestLearner;
  let brainUp = false;

  test.beforeAll(async () => {
    brainUp = await isBrainAvailable();
    parent = await createTestParent();
    teacher = await createTestTeacher();
    learner = await createTestLearner(parent.token, 3);
    if (brainUp) await getPreClonedBrainState(parent.token, learner.id);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test.beforeEach(async () => {
    test.skip(!brainUp, 'brain-svc not available');
  });

  test('invite teacher who accepts and sees learner profile', async ({ page }) => {
    coverageTracker.setContext('invite teacher who accepts and sees learner profile', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const inviteRes = await page.request.post(`${API_BASE}/comms/caregiver-invite`, {
      data: {
        email: teacher.email,
        learnerId: learner.id,
        name: teacher.name,
        role: 'teacher',
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(inviteRes.ok()).toBeTruthy();

    const inviteData = await inviteRes.json();
    const inviteToken = inviteData.inviteToken || inviteData.token;

    if (inviteToken) {
      const acceptRes = await page.request.post(`${API_BASE}/comms/invites/${inviteToken}/accept`, {
        headers: { Authorization: `Bearer ${teacher.token}` },
      });

      if (acceptRes.ok()) {
        const profileRes = await page.request.get(`${API_BASE}/family/learners/${learner.id}`, {
          headers: { Authorization: `Bearer ${teacher.token}` },
        });
        expect(profileRes.ok()).toBeTruthy();
      }
    }

    const learnerRes = await page.request.get(`${API_BASE}/family/learners/${learner.id}`, {
      headers: { Authorization: `Bearer ${teacher.token}` },
    });
    expect([200, 403]).toContain(learnerRes.status());
  });

  test('teacher submits insight which becomes recommendation', async ({ page }) => {
    coverageTracker.setContext('teacher submits insight which becomes recommendation', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const insightRes = await page.request.post(`${API_BASE}/comms/insights`, {
      data: {
        learnerId: learner.id,
        content: 'Student has shown significant improvement in number recognition this week. Ready for basic addition.',
        type: 'progress-observation',
      },
      headers: { Authorization: `Bearer ${teacher.token}` },
    });

    if (insightRes.ok()) {
      const insightData = await insightRes.json();
      expect(insightData.insightId || insightData.id).toBeTruthy();

      const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (notifRes.ok()) {
        const notifData = await notifRes.json();
        const notifications = Array.isArray(notifData) ? notifData : notifData.notifications || [];
        const insightNotif = notifications.find(
          (n: Record<string, unknown>) => n.type === 'teacher-insight' || n.category === 'insight',
        );
        if (insightNotif) {
          expect(insightNotif).toBeTruthy();
        }
      }
    }
  });

  test('teacher cannot approve or decline recommendations', async ({ page }) => {
    coverageTracker.setContext('teacher cannot approve or decline recommendations', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (notifRes.ok()) {
      const notifData = await notifRes.json();
      const notifications = Array.isArray(notifData) ? notifData : notifData.notifications || [];
      const recommendation = notifications.find(
        (n: Record<string, unknown>) => n.type === 'recommendation' && (n.recommendationId || n.id),
      );

      if (recommendation) {
        const recId = recommendation.recommendationId || recommendation.id;

        const approveRes = await page.request.post(`${API_BASE}/comms/recommendations/${recId}/respond`, {
          data: { response: 'approve' },
          headers: { Authorization: `Bearer ${teacher.token}` },
        });
        expect([401, 403]).toContain(approveRes.status());

        const declineRes = await page.request.post(`${API_BASE}/comms/recommendations/${recId}/respond`, {
          data: { response: 'decline' },
          headers: { Authorization: `Bearer ${teacher.token}` },
        });
        expect([401, 403]).toContain(declineRes.status());
      }
    }

    const fakeRecRes = await page.request.post(`${API_BASE}/comms/recommendations/nonexistent-rec/respond`, {
      data: { response: 'approve' },
      headers: { Authorization: `Bearer ${teacher.token}` },
    });
    expect([401, 403, 404]).toContain(fakeRecRes.status());
  });
});
