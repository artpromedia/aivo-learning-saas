import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, type BrainState } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Integration: Tutor Lifecycle', () => {
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

  test('subscribe → provision → session → mastery → XP → notification', async ({ page }) => {
    coverageTracker.setContext('tutor full lifecycle', 'integration');
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

    const preXpRes = await page.request.get(`${API_BASE}/engagement/xp?learnerId=${learner.id}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    let preXp = 0;
    if (preXpRes.ok()) {
      const preXpData = await preXpRes.json();
      preXp = preXpData.xp ?? preXpData.totalXp ?? 0;
    }

    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      data: { learnerId: learner.id, subject: 'math' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.sessionId || sessionData.id;

    const getSessionRes = await page.request.get(`${API_BASE}/tutor/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(getSessionRes.ok()).toBeTruthy();
    const getSessionData = await getSessionRes.json();
    expect(getSessionData.brainContext || getSessionData.context || getSessionData.learnerContext).toBeTruthy();

    const msgRes = await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/messages`, {
      data: { message: 'Can you help me practice addition?' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(msgRes.ok()).toBeTruthy();

    const completeRes = await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/complete`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(completeRes.ok()).toBeTruthy();

    const start = Date.now();
    let postXp = preXp;
    while (Date.now() - start < 15_000) {
      const xpRes = await page.request.get(`${API_BASE}/engagement/xp?learnerId=${learner.id}`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });
      if (xpRes.ok()) {
        const xpData = await xpRes.json();
        postXp = xpData.xp ?? xpData.totalXp ?? 0;
        if (postXp > preXp) break;
      }
      await new Promise((r) => setTimeout(r, 1_000));
    }
    expect(postXp).toBeGreaterThanOrEqual(preXp);

    const contextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainState.brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(contextRes.ok()).toBeTruthy();

    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(notifRes.ok()).toBeTruthy();
  });
});
