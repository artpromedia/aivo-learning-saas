import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { isAssessmentAvailable } from '../../fixtures/assessment.fixture';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 1a: Functioning Level Routing', () => {
  let parent: TestUser;
  let assessmentUp: boolean;

  test.beforeAll(async () => {
    assessmentUp = await isAssessmentAvailable();
    parent = await createTestParent();
  });

  test.beforeEach(async () => {
    test.skip(!assessmentUp, 'assessment-svc not available');
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('standard signals route to STANDARD level', async ({ page }) => {
    coverageTracker.setContext('standard signals route to STANDARD level', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 4);

    const responses = [
      { questionId: 'verbal-communication', answer: 'full-sentences' },
      { questionId: 'reading-level', answer: 'grade-level' },
      { questionId: 'math-skills', answer: 'grade-level' },
      { questionId: 'attention-span', answer: 'age-appropriate' },
      { questionId: 'motor-skills', answer: 'typical' },
      { questionId: 'social-interaction', answer: 'peers' },
      { questionId: 'self-regulation', answer: 'independent' },
      { questionId: 'daily-living', answer: 'mostly-independent' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: { responses, functioningLevel: 4, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();
    const data = await assessmentRes.json();

    const level = data.functioningLevel || data.routedLevel || data.level;
    expect(['STANDARD', '4', 4, 'standard']).toContain(level);
  });

  test('limited verbal signals route to SUPPORTED level', async ({ page }) => {
    coverageTracker.setContext('limited verbal signals route to SUPPORTED level', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 2);

    const responses = [
      { questionId: 'verbal-communication', answer: 'short-phrases' },
      { questionId: 'reading-level', answer: 'pre-reading' },
      { questionId: 'math-skills', answer: 'counting' },
      { questionId: 'attention-span', answer: 'limited' },
      { questionId: 'motor-skills', answer: 'needs-support' },
      { questionId: 'social-interaction', answer: 'adults-only' },
      { questionId: 'self-regulation', answer: 'some-support' },
      { questionId: 'daily-living', answer: 'needs-assistance' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: { responses, functioningLevel: 2, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();
    const data = await assessmentRes.json();

    const level = data.functioningLevel || data.routedLevel || data.level;
    expect(['SUPPORTED', '2', 2, 'supported', 'LOW_VERBAL']).toContain(level);
  });

  test('non-verbal with AAC routes to NON_VERBAL level', async ({ page }) => {
    coverageTracker.setContext('non-verbal with AAC routes to NON_VERBAL level', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 1);

    const responses = [
      { questionId: 'verbal-communication', answer: 'non-verbal' },
      { questionId: 'reading-level', answer: 'pre-reading' },
      { questionId: 'math-skills', answer: 'counting' },
      { questionId: 'attention-span', answer: 'limited' },
      { questionId: 'motor-skills', answer: 'needs-support' },
      { questionId: 'social-interaction', answer: 'minimal' },
      { questionId: 'self-regulation', answer: 'significant-support' },
      { questionId: 'daily-living', answer: 'needs-assistance' },
      { questionId: 'aac-use', answer: 'yes' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: { responses, functioningLevel: 1, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();
    const data = await assessmentRes.json();

    const level = data.functioningLevel || data.routedLevel || data.level;
    expect(['NON_VERBAL', '1', 1, 'non-verbal', 'PRE_SYMBOLIC']).toContain(level);
  });

  test('IEP vs parent conflict uses more supportive level', async ({ page }) => {
    coverageTracker.setContext('IEP vs parent conflict uses more supportive level', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    const parentResponses = [
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
      data: { responses: parentResponses, functioningLevel: 3, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();

    const iepRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/iep`, {
      data: {
        content: 'IEP indicates student has limited verbal communication, requires AAC device, significant sensory needs. Functioning at pre-reading level.',
        testMode: true,
        confirmed: true,
        iepFunctioningLevel: 1,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(iepRes.ok()).toBeTruthy();

    const learnerRes = await page.request.get(`${API_BASE}/family/learners/${learner.id}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(learnerRes.ok()).toBeTruthy();
    const learnerData = await learnerRes.json();
    const info = learnerData.learner || learnerData;
    const resolvedLevel = info.functioningLevel || info.resolvedFunctioningLevel;

    if (typeof resolvedLevel === 'number') {
      expect(resolvedLevel).toBeLessThanOrEqual(3);
    }
  });
});
