import { test, expect } from '@playwright/test';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { waitForBrainCloned } from '../../helpers/wait-for-nats';
import { isBrainAvailable } from '../../fixtures/brain.fixture';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Integration: Full Onboarding Flow', () => {
  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test.beforeEach(async () => {
    test.skip(!(await isBrainAvailable()), 'brain-svc not available');
  });

  test('complete onboarding: signup → child → assessment → IEP → baseline → brain → approve', async ({ page }) => {
    coverageTracker.setContext('complete onboarding flow', 'integration');
    await coverageTracker.attach(page);

    const email = `e2e+onboarding-${Date.now()}@aivo.test`;
    const password = 'E2eTest!Secure456';

    const signUpRes = await page.request.post(`${API_BASE}/auth/sign-up`, {
      data: { email, password, name: 'Onboarding Test Parent', role: 'parent' },
    });
    expect(signUpRes.ok()).toBeTruthy();

    await page.request.post(`${API_BASE}/test/verify-email`, { data: { email } });

    const signInRes = await page.request.post(`${API_BASE}/auth/sign-in`, {
      data: { email, password },
    });
    expect(signInRes.ok()).toBeTruthy();
    const signInData = await signInRes.json();
    const parentToken = signInData.token || signInData.session?.token;
    expect(parentToken).toBeTruthy();

    const learnerRes = await page.request.post(`${API_BASE}/family/learners`, {
      data: {
        name: 'Onboarding Test Child',
        dateOfBirth: '2016-06-15',
        gradeLevel: '3rd',
        functioningLevel: 3,
        specialNeeds: [],
      },
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    expect(learnerRes.ok()).toBeTruthy();
    const learnerData = await learnerRes.json();
    const learnerId = learnerData.learner?.id || learnerData.id;
    expect(learnerId).toBeTruthy();

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learnerId}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'below-grade' },
          { questionId: 'math-skills', answer: 'basic-operations' },
          { questionId: 'attention-span', answer: 'age-appropriate' },
          { questionId: 'motor-skills', answer: 'typical' },
          { questionId: 'social-interaction', answer: 'peers' },
          { questionId: 'self-regulation', answer: 'some-support' },
          { questionId: 'daily-living', answer: 'mostly-independent' },
        ],
        functioningLevel: 3,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();

    const iepRes = await page.request.post(`${API_BASE}/family/learners/${learnerId}/iep`, {
      data: {
        content: 'IEP: Reading at 2nd grade level. Goals: Improve reading fluency and comprehension.',
        testMode: true,
        confirmed: true,
      },
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    expect(iepRes.ok()).toBeTruthy();

    const brainResult = await waitForBrainCloned(parentToken, learnerId, { timeoutMs: 30_000 });
    expect(brainResult.brainId).toBeTruthy();

    const contextRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brainResult.brainId}/context`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    expect(contextRes.ok()).toBeTruthy();

    const approveRes = await page.request.post(`${BRAIN_API}/brain/profiles/${brainResult.brainId}/approve`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    expect(approveRes.ok()).toBeTruthy();
    const approveData = await approveRes.json();
    expect(['active', 'approved']).toContain(approveData.status);

    const eventsRes = await page.request.get(
      `${API_BASE}/test/nats-events?learnerId=${learnerId}`,
      { headers: { Authorization: `Bearer ${parentToken}` } },
    );
    if (eventsRes.ok()) {
      const events = await eventsRes.json();
      const eventList = Array.isArray(events) ? events : events.events || [];
      const subjects = eventList.map((e: Record<string, unknown>) => e.subject);
      expect(
        subjects.includes('assessment.baseline.completed') ||
        eventList.length > 0
      ).toBeTruthy();
    }

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).first().fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });
});
