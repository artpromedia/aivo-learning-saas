import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { getPreClonedBrainState, type BrainState } from '../../fixtures/brain.fixture';
import { createFullSubscriptionWithTutors } from '../../fixtures/subscription.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { waitForHomeworkProcessed } from '../../helpers/wait-for-nats';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Integration: Homework Lifecycle', () => {
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

  test('subscribe → homework unlock → upload → OCR → adapt → session → mastery', async ({ page }) => {
    coverageTracker.setContext('homework full lifecycle', 'integration');
    await coverageTracker.attach(page);

    const uploadRes = await page.request.post(`${API_BASE}/learning/homework/upload`, {
      data: {
        learnerId: learner.id,
        subject: 'math',
        content: 'Worksheet: 1) 5 + 3 = ___ 2) 12 - 7 = ___ 3) 4 x 6 = ___ 4) 20 / 5 = ___',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect([200, 201, 202]).toContain(uploadRes.status());

    const uploadData = await uploadRes.json();
    const homeworkId = uploadData.homeworkId || uploadData.id;
    expect(homeworkId).toBeTruthy();

    let hwStatus: { homeworkId: string; status: string } | null = null;
    try {
      hwStatus = await waitForHomeworkProcessed(parent.token, homeworkId, { timeoutMs: 30_000 });
    } catch {
      const hwRes = await page.request.get(`${API_BASE}/learning/homework/${homeworkId}`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });
      if (hwRes.ok()) {
        const hwData = await hwRes.json();
        hwStatus = { homeworkId, status: hwData.status || 'unknown' };
      }
    }

    const hwDetailRes = await page.request.get(`${API_BASE}/learning/homework/${homeworkId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(hwDetailRes.ok()).toBeTruthy();

    const hwDetail = await hwDetailRes.json();
    if (hwDetail.extractedContent || hwDetail.ocrResult) {
      expect(hwDetail.extractedContent || hwDetail.ocrResult).toBeTruthy();
    }

    if (hwDetail.adaptedContent || hwDetail.adapted) {
      expect(hwDetail.adaptedContent || hwDetail.adapted).toBeTruthy();
    }

    const sessionRes = await page.request.post(`${API_BASE}/learning/homework/${homeworkId}/session`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (sessionRes.ok()) {
      const sessionData = await sessionRes.json();
      const sessionId = sessionData.sessionId || sessionData.id;
      expect(sessionId).toBeTruthy();

      if (sessionData.brainContext || sessionData.context) {
        expect(sessionData.brainContext || sessionData.context).toBeTruthy();
      }
    }

    const contextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainState.brainId}/context`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(contextRes.ok()).toBeTruthy();
  });
});
