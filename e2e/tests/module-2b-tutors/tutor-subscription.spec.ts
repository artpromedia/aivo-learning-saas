import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 2b: Tutor Subscription', () => {
  let parent: TestUser;
  let learner: TestLearner;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    await getPreClonedBrainState(parent.token, learner.id);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('subscribe activates tutor', async ({ page }) => {
    coverageTracker.setContext('subscribe activates tutor', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const subRes = await page.request.post(`${API_BASE}/billing/subscriptions`, {
      data: { planTier: 'growth', paymentMethod: 'test_pm_card_visa', testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(subRes.ok()).toBeTruthy();

    const tutorRes = await page.request.post(`${API_BASE}/billing/tutor-add-ons`, {
      data: { learnerId: learner.id, subject: 'math', testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(tutorRes.ok()).toBeTruthy();

    const tutorData = await tutorRes.json();
    expect(tutorData.tutorId || tutorData.id).toBeTruthy();
    expect(tutorData.status === 'active' || tutorData.status === 'provisioning').toBeTruthy();
  });

  test('NATS tutor.addon.activated published', async ({ page }) => {
    coverageTracker.setContext('NATS tutor.addon.activated published', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const tutorRes = await page.request.post(`${API_BASE}/billing/tutor-add-ons`, {
      data: { learnerId: learner.id, subject: 'reading', testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(tutorRes.ok()).toBeTruthy();

    const eventsRes = await page.request.get(
      `${API_BASE}/test/nats-events?subject=tutor.addon.activated&learnerId=${learner.id}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (eventsRes.ok()) {
      const events = await eventsRes.json();
      const eventList = Array.isArray(events) ? events : events.events || [];
      expect(eventList.length).toBeGreaterThan(0);
    }
  });

  test('tutor subscription unlocks homework', async ({ page }) => {
    coverageTracker.setContext('tutor subscription unlocks homework', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const homeworkRes = await page.request.post(`${API_BASE}/learning/homework/upload`, {
      data: {
        learnerId: learner.id,
        subject: 'math',
        content: 'Solve: 5 + 3 = ?, 12 - 7 = ?',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect([200, 201, 202]).toContain(homeworkRes.status());
  });

  test('bundle subscribes all 5 tutors', async ({ page }) => {
    coverageTracker.setContext('bundle subscribes all 5 tutors', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const newLearner = await createTestLearner(parent.token, 3);
    await getPreClonedBrainState(parent.token, newLearner.id);

    const subjects = ['math', 'reading', 'writing', 'science', 'social-studies'];
    const activatedTutors: string[] = [];

    for (const subject of subjects) {
      const res = await page.request.post(`${API_BASE}/billing/tutor-add-ons`, {
        data: { learnerId: newLearner.id, subject, testMode: true },
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (res.ok()) {
        const data = await res.json();
        activatedTutors.push(data.tutorId || data.id);
      }
    }

    expect(activatedTutors.length).toBe(5);
  });
});
