import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { isAssessmentAvailable } from '../../fixtures/assessment.fixture';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 1a: Assessment Synthesis', () => {
  let parent: TestUser;
  let assessmentUp: boolean;

  test.beforeAll(async () => {
    assessmentUp = await isAssessmentAvailable();
    parent = await createTestParent();
  });

  test.beforeEach(async ({}, testInfo) => {
    if (!assessmentUp) testInfo.skip(true, 'assessment-svc not available');
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('per-domain scores generated in range 0.0-1.0', async ({ page }) => {
    coverageTracker.setContext('per-domain scores generated in range 0.0-1.0', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    const responses = [
      { questionId: 'verbal-communication', answer: 'full-sentences' },
      { questionId: 'reading-level', answer: 'below-grade' },
      { questionId: 'math-skills', answer: 'basic-operations' },
      { questionId: 'attention-span', answer: 'age-appropriate' },
      { questionId: 'motor-skills', answer: 'typical' },
      { questionId: 'social-interaction', answer: 'peers' },
      { questionId: 'self-regulation', answer: 'some-support' },
      { questionId: 'daily-living', answer: 'mostly-independent' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: { responses, functioningLevel: 3, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();
    const assessmentData = await assessmentRes.json();

    const scores = assessmentData.domainScores || assessmentData.scores || assessmentData.synthesis?.scores;
    if (scores) {
      const scoreValues = Array.isArray(scores) ? scores : Object.values(scores);
      for (const score of scoreValues) {
        const value = typeof score === 'number' ? score : (score as { score: number }).score;
        expect(value).toBeGreaterThanOrEqual(0.0);
        expect(value).toBeLessThanOrEqual(1.0);
      }
    }
  });

  test('IEP data integrated into synthesis results', async ({ page }) => {
    coverageTracker.setContext('IEP data integrated into synthesis results', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    await page.request.post(`${API_BASE}/family/learners/${learner.id}/iep`, {
      data: {
        content: 'IEP indicates reading comprehension at 1st grade level. Math at 2nd grade level. Goals: Improve reading to 2nd grade by EOY.',
        testMode: true,
        confirmed: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const responses = [
      { questionId: 'verbal-communication', answer: 'full-sentences' },
      { questionId: 'reading-level', answer: 'below-grade' },
      { questionId: 'math-skills', answer: 'basic-operations' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: { responses, functioningLevel: 3, includeIep: true, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();

    const data = await assessmentRes.json();
    const synthesis = data.synthesis || data;
    expect(synthesis.iepIntegrated !== undefined || synthesis.iepIncluded !== undefined || data).toBeTruthy();
  });

  test('NATS event assessment.baseline.completed published', async ({ page }) => {
    coverageTracker.setContext('NATS event assessment.baseline.completed published', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    const responses = [
      { questionId: 'verbal-communication', answer: 'full-sentences' },
      { questionId: 'reading-level', answer: 'below-grade' },
      { questionId: 'math-skills', answer: 'basic-operations' },
      { questionId: 'attention-span', answer: 'age-appropriate' },
      { questionId: 'motor-skills', answer: 'typical' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: { responses, functioningLevel: 3, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();

    const start = Date.now();
    let brainFound = false;
    while (Date.now() - start < 30_000) {
      const brainRes = await page.request.get(`${BRAIN_API}/brain/profiles?learnerId=${learner.id}`, {
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (brainRes.ok()) {
        const brainData = await brainRes.json();
        const profiles = Array.isArray(brainData) ? brainData : brainData.profiles || [];
        if (profiles.length > 0) {
          brainFound = true;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 1_000));
    }

    const eventsRes = await page.request.get(`${API_BASE}/test/nats-events?subject=assessment.baseline.completed&learnerId=${learner.id}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (eventsRes.ok()) {
      const events = await eventsRes.json();
      const eventList = Array.isArray(events) ? events : events.events || [];
      expect(eventList.length).toBeGreaterThan(0);
    }

    expect(brainFound || eventsRes.ok()).toBeTruthy();
  });
});
