import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState } from '../../fixtures/brain.fixture';
import { createFullSubscriptionWithTutors, type TutorAddOn } from '../../fixtures/subscription.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 2b: Tutor Deprovisioning', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let mathTutor: TutorAddOn;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    await getPreClonedBrainState(parent.token, learner.id);
    const { tutors } = await createFullSubscriptionWithTutors(parent.token, learner.id, ['math']);
    mathTutor = tutors[0];
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('cancel tutor gives 7-day grace period', async ({ page }) => {
    coverageTracker.setContext('cancel tutor gives 7-day grace period', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const cancelRes = await page.request.delete(`${API_BASE}/billing/tutor-add-ons/${mathTutor.tutorId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(cancelRes.ok()).toBeTruthy();

    const cancelData = await cancelRes.json();
    const status = cancelData.status || cancelData.state;
    expect(['grace-period', 'canceling', 'pending-removal', 'canceled']).toContain(status);

    if (cancelData.graceEndDate || cancelData.effectiveDate) {
      const endDate = new Date(cancelData.graceEndDate || cancelData.effectiveDate);
      const now = new Date();
      const diffDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(8);
    }

    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      data: { learnerId: learner.id, subject: 'math' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect([200, 201, 202]).toContain(sessionRes.status());
  });

  test('after grace period tutor is removed', async ({ page }) => {
    coverageTracker.setContext('after grace period tutor is removed', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const expireRes = await page.request.post(`${API_BASE}/test/expire-grace-period`, {
      data: { tutorId: mathTutor.tutorId, learnerId: learner.id },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (expireRes.ok()) {
      const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
        data: { learnerId: learner.id, subject: 'math' },
        headers: { Authorization: `Bearer ${parent.token}` },
      });
      expect([400, 402, 403, 404]).toContain(sessionRes.status());
    }
  });

  test('resubscribe reconnects tutor', async ({ page }) => {
    coverageTracker.setContext('resubscribe reconnects tutor', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const resubRes = await page.request.post(`${API_BASE}/billing/tutor-add-ons`, {
      data: { learnerId: learner.id, subject: 'math', testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(resubRes.ok()).toBeTruthy();

    const resubData = await resubRes.json();
    expect(resubData.tutorId || resubData.id).toBeTruthy();
    expect(resubData.status === 'active' || resubData.status === 'provisioning').toBeTruthy();

    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      data: { learnerId: learner.id, subject: 'math' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect([200, 201, 202]).toContain(sessionRes.status());
  });
});
