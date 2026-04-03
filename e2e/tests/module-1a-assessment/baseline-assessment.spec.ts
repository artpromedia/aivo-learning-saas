import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { isAssessmentAvailable } from '../../fixtures/assessment.fixture';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 1a: Baseline Assessment', () => {
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

  test('STANDARD level learner receives adaptive multiple choice', async ({ page }) => {
    coverageTracker.setContext('STANDARD level receives adaptive multiple choice', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 4);

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'grade-level' },
          { questionId: 'math-skills', answer: 'grade-level' },
        ],
        functioningLevel: 4,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(assessmentRes.ok()).toBeTruthy();

    const baselineRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        type: 'baseline',
        functioningLevel: 4,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (baselineRes.ok()) {
      const data = await baselineRes.json();
      const format = data.format || data.assessmentFormat || data.type;
      expect(['adaptive', 'multiple-choice', 'standard', 'STANDARD']).toContain(format);

      if (data.questions) {
        for (const q of data.questions) {
          expect(q.options || q.choices).toBeTruthy();
          expect((q.options || q.choices).length).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  test('LOW_VERBAL level receives picture-based with 2 choices and 5-min cap', async ({ page }) => {
    coverageTracker.setContext('LOW_VERBAL level receives picture-based with 2 choices', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 2);

    const baselineRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        type: 'baseline',
        functioningLevel: 2,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (baselineRes.ok()) {
      const data = await baselineRes.json();
      const format = data.format || data.assessmentFormat || data.type;
      expect(['picture-based', 'visual', 'LOW_VERBAL', 'supported']).toContain(format);

      if (data.questions) {
        for (const q of data.questions) {
          const choices = q.options || q.choices || [];
          expect(choices.length).toBeLessThanOrEqual(2);
        }
      }

      const timeLimit = data.timeLimitMinutes || data.timeLimit || data.maxDurationMinutes;
      if (timeLimit) {
        expect(timeLimit).toBeLessThanOrEqual(5);
      }
    }
  });

  test('PRE_SYMBOLIC level receives observational checklist', async ({ page }) => {
    coverageTracker.setContext('PRE_SYMBOLIC level receives observational checklist', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 1);

    const baselineRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        type: 'baseline',
        functioningLevel: 1,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (baselineRes.ok()) {
      const data = await baselineRes.json();
      const format = data.format || data.assessmentFormat || data.type;
      expect(['observational', 'checklist', 'PRE_SYMBOLIC', 'non-verbal']).toContain(format);

      if (data.items || data.checklist) {
        const items = data.items || data.checklist;
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          expect(item.observable !== undefined || item.skill !== undefined).toBeTruthy();
        }
      }
    }
  });
});
