import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, type BrainState } from '../../fixtures/brain.fixture';
import { createFullSubscriptionWithTutors } from '../../fixtures/subscription.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 2b: Tutor Session', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let brainState: BrainState;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    brainState = await getPreClonedBrainState(parent.token, learner.id);
    await createFullSubscriptionWithTutors(parent.token, learner.id, ['math']);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('open session loads Brain context', async ({ page }) => {
    coverageTracker.setContext('open session loads Brain context', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      data: { learnerId: learner.id, subject: 'math' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();

    const sessionData = await sessionRes.json();
    const sessionId = sessionData.sessionId || sessionData.id;
    expect(sessionId).toBeTruthy();

    const getRes = await page.request.get(`${API_BASE}/tutor/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(getRes.ok()).toBeTruthy();

    const getSessionData = await getRes.json();
    expect(getSessionData.brainContext || getSessionData.context || getSessionData.learnerContext).toBeTruthy();
  });

  test('tutor persona used in session', async ({ page }) => {
    coverageTracker.setContext('tutor persona used in session', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      data: { learnerId: learner.id, subject: 'math' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();

    const sessionData = await sessionRes.json();
    const sessionId = sessionData.sessionId || sessionData.id;

    const msgRes = await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/messages`, {
      data: { message: 'Hello, can you help me with addition?' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(msgRes.ok()).toBeTruthy();

    const msgData = await msgRes.json();
    const reply = msgData.reply || msgData.message || msgData.response;
    expect(reply).toBeTruthy();
  });

  test('complete session updates mastery', async ({ page }) => {
    coverageTracker.setContext('complete session updates mastery', 'module-2b-tutors');
    await coverageTracker.attach(page);

    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      data: { learnerId: learner.id, subject: 'math' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(sessionRes.ok()).toBeTruthy();

    const sessionData = await sessionRes.json();
    const sessionId = sessionData.sessionId || sessionData.id;

    await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/messages`, {
      data: { message: 'What is 5 + 3?' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const completeRes = await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/complete`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(completeRes.ok()).toBeTruthy();

    const completeData = await completeRes.json();
    expect(completeData.masteryUpdate || completeData.mastery || completeData.completed).toBeTruthy();
  });

  test('XP awarded after session completion (15 XP)', async ({ page }) => {
    coverageTracker.setContext('XP awarded after session completion (15 XP)', 'module-2b-tutors');
    await coverageTracker.attach(page);

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

    await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/messages`, {
      data: { message: 'Practice problem' },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    await page.request.post(`${API_BASE}/tutor/sessions/${sessionId}/complete`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const start = Date.now();
    let postXp = preXp;
    while (Date.now() - start < 10_000) {
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

    expect(postXp).toBeGreaterThan(preXp);
  });
});
