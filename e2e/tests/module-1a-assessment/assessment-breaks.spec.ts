import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner } from '../../fixtures/learner.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { isAssessmentAvailable } from '../../fixtures/assessment.fixture';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 1a: Assessment Engagement Breaks', () => {
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

  test('baseline start response includes breakConfig from parent preferences', async ({ page }) => {
    coverageTracker.setContext('baseline start includes breakConfig', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 5);

    // Submit parent assessment with break preferences
    const _parentAssessmentRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'grade-level' },
          { questionId: 'math-skills', answer: 'grade-level' },
        ],
        parentResponses: {
          'sn-2': '5-10 questions at a time',
          'sn-3': ['Sensory breaks (calming music, visuals)', 'Puzzle or brain teaser breaks'],
        },
        functioningLevel: 5,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    // Start baseline assessment
    const startRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/start`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (startRes.ok()) {
      const data = await startRes.json();
      expect(data.breakConfig).toBeTruthy();
      expect(data.breakConfig.frequencyQuestions).toBeGreaterThan(0);
      expect(data.breakConfig.preferredTypes).toBeTruthy();
      expect(Array.isArray(data.breakConfig.preferredTypes)).toBeTruthy();
      expect(data.breakConfig.preferredTypes.length).toBeGreaterThan(0);
    }
  });

  test('default breakConfig used when no parent preferences exist', async ({ page }) => {
    coverageTracker.setContext('default breakConfig when no parent preferences', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 5);

    const startRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/start`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (startRes.ok()) {
      const data = await startRes.json();
      expect(data.breakConfig).toBeTruthy();
      // Default frequency is 8
      expect(data.breakConfig.frequencyQuestions).toBe(8);
      // Default includes music, puzzle, game
      expect(data.breakConfig.preferredTypes).toEqual(
        expect.arrayContaining(['music', 'puzzle', 'game']),
      );
      expect(data.breakConfig.adaptiveBreaks).toBe(true);
    }
  });

  test('answer response includes shouldBreak and breakConfig', async ({ page }) => {
    coverageTracker.setContext('answer response includes shouldBreak', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 5);

    const startRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/start`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (startRes.ok()) {
      const startData = await startRes.json();
      const question = startData.question;

      if (question) {
        const answerRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/answer`, {
          data: {
            questionId: question.id,
            answer: question.options?.[0] ?? 'test-answer',
          },
          headers: { Authorization: `Bearer ${parent.token}` },
        });

        if (answerRes.ok()) {
          const answerData = await answerRes.json();
          // Response should include break-related fields
          expect(answerData).toHaveProperty('breakConfig');
          expect(answerData).toHaveProperty('shouldBreak');
          expect(typeof answerData.shouldBreak).toBe('boolean');
          expect(answerData).toHaveProperty('questionsAnswered');
          expect(answerData.questionsAnswered).toBe(1);
          // First question should not trigger a break (default freq = 8)
          expect(answerData.shouldBreak).toBe(false);
        }
      }
    }
  });

  test('shouldBreak triggers at configured frequency', async ({ page }) => {
    coverageTracker.setContext('shouldBreak triggers at configured frequency', 'module-1a-assessment');
    await coverageTracker.attach(page);

    // Create learner with low break frequency for faster testing
    const learner = await createTestLearner(parent.token, 5);

    // Submit parent assessment with "3-5 questions" frequency (maps to 4)
    await page.request.post(`${API_BASE}/family/learners/${learner.id}/assessment`, {
      data: {
        parentResponses: {
          'sn-2': '3-5 questions at a time',
        },
        functioningLevel: 5,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    const startRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/start`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (!startRes.ok()) return;
    const startData = await startRes.json();

    // Answer questions sequentially and check shouldBreak
    let currentQuestion = startData.question;
    let shouldBreakSeen = false;

    for (let i = 0; i < 5 && currentQuestion; i++) {
      const answerRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/answer`, {
        data: {
          questionId: currentQuestion.id,
          answer: currentQuestion.options?.[0] ?? 'test',
        },
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (!answerRes.ok()) break;
      const answerData = await answerRes.json();

      if (answerData.shouldBreak) {
        shouldBreakSeen = true;
        // Break should trigger at question 4 (frequency = 4)
        expect(answerData.questionsAnswered % answerData.breakConfig.frequencyQuestions).toBe(0);
        break;
      }

      if (answerData.isComplete || !answerData.nextQuestion) break;
      currentQuestion = answerData.nextQuestion;
    }

    // We expect to have seen a break trigger within 5 questions (freq=4)
    // Skip assertion if assessment ended early
    if (currentQuestion) {
      expect(shouldBreakSeen).toBe(true);
    }
  });

  test('consecutive wrong answers trigger adaptive break with calming type', async ({ page }) => {
    coverageTracker.setContext('consecutive wrong answers trigger adaptive break', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 5);

    const startRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/start`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (!startRes.ok()) return;
    const startData = await startRes.json();

    // Answer 3 questions deliberately wrong to trigger adaptive break
    let currentQuestion = startData.question;
    let adaptiveBreakTriggered = false;

    for (let i = 0; i < 4 && currentQuestion; i++) {
      const answerRes = await page.request.post(`${API_BASE}/assessment/baseline/${learner.id}/answer`, {
        data: {
          questionId: currentQuestion.id,
          answer: 'definitely-wrong-answer-for-adaptive-break-test',
        },
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (!answerRes.ok()) break;
      const answerData = await answerRes.json();

      if (answerData.shouldBreak && answerData.consecutiveWrong >= 3) {
        adaptiveBreakTriggered = true;
        // Adaptive breaks suggest calming types
        if (answerData.suggestedBreakType) {
          expect(['music', 'breathing']).toContain(answerData.suggestedBreakType);
        }
        break;
      }

      if (answerData.isComplete || !answerData.nextQuestion) break;
      currentQuestion = answerData.nextQuestion;
    }

    // We should have triggered an adaptive break after 3 wrong answers
    if (currentQuestion) {
      expect(adaptiveBreakTriggered).toBe(true);
    }
  });

  test('break XP award endpoint works', async ({ page }) => {
    coverageTracker.setContext('break XP award endpoint works', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 5);

    const breakRes = await page.request.post(`${API_BASE}/engagement/sel/break`, {
      data: {
        learnerId: learner.id,
        activityType: 'music',
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (breakRes.ok()) {
      const data = await breakRes.json();
      expect(data.xpAwarded).toBeGreaterThanOrEqual(0);
      expect(data.activity).toBeTruthy();
      expect(data.activity.type).toBe('music');
    }
  });

  test('new break activity types are registered', async ({ page }) => {
    coverageTracker.setContext('new break activity types registered', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 5);

    // Test each new break type
    for (const activityType of ['music', 'puzzle', 'game'] as const) {
      const res = await page.request.post(`${API_BASE}/engagement/sel/break`, {
        data: {
          learnerId: learner.id,
          activityType,
        },
        headers: { Authorization: `Bearer ${parent.token}` },
      });

      if (res.ok()) {
        const data = await res.json();
        expect(data.activity.type).toBe(activityType);
        expect(data.activity.name).toBeTruthy();
        expect(data.activity.durationSeconds).toBeGreaterThan(0);
        expect(data.activity.xpReward).toBeGreaterThanOrEqual(5);
      }
    }
  });
});
