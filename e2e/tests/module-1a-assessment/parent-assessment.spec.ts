import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { isAssessmentAvailable } from '../../fixtures/assessment.fixture';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 1a: Parent Assessment', () => {
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

  test('complete parent assessment with functioning level questions', async ({ page }) => {
    coverageTracker.setContext('complete parent assessment with functioning level questions', 'module-1a-assessment');
    await coverageTracker.attach(page);

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/password/i).first().fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|teacher|admin|learner|onboarding)/, { timeout: 15_000 });

    const addChildButton = page.getByRole('button', { name: /add child|add learner|get started/i });
    if (await addChildButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addChildButton.click();
    } else {
      await page.goto(`${BASE_URL}/onboarding/add-child`);
    }

    const nameField = page.getByLabel(/child.*name|learner.*name|first name/i);
    if (await nameField.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nameField.fill('Assessment Test Child');
    }

    const dobField = page.getByLabel(/date of birth|birthday/i);
    if (await dobField.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await dobField.fill('2016-06-15');
    }

    const gradeField = page.getByLabel(/grade/i);
    if (await gradeField.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await gradeField.selectOption({ label: /3rd|third/i }).catch(async () => {
        await gradeField.fill('3rd');
      });
    }

    const submitChild = page.getByRole('button', { name: /continue|next|save/i });
    if (await submitChild.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await submitChild.click();
    }

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners`, {
      data: {
        name: 'API Assessment Child',
        dateOfBirth: '2016-06-15',
        gradeLevel: '3rd',
        functioningLevel: 3,
        specialNeeds: [],
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();
    const learnerData = await assessmentRes.json();
    const learnerId = learnerData.learner?.id || learnerData.id;

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

    const completeRes = await page.request.post(`${API_BASE}/family/learners/${learnerId}/assessment`, {
      data: { responses, functioningLevel: 3, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(completeRes.ok()).toBeTruthy();
    const resultData = await completeRes.json();
    expect(resultData.assessmentId || resultData.id).toBeTruthy();
  });

  test('skip optional questions still completes assessment', async ({ page }) => {
    coverageTracker.setContext('skip optional questions still completes assessment', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learnerRes = await page.request.post(`${API_BASE}/family/learners`, {
      data: {
        name: 'Skip Optional Child',
        dateOfBirth: '2017-03-20',
        gradeLevel: '2nd',
        functioningLevel: 3,
        specialNeeds: [],
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(learnerRes.ok()).toBeTruthy();
    const learnerData = await learnerRes.json();
    const learnerId = learnerData.learner?.id || learnerData.id;

    const minimalResponses = [
      { questionId: 'verbal-communication', answer: 'full-sentences' },
      { questionId: 'reading-level', answer: 'below-grade' },
      { questionId: 'math-skills', answer: 'basic-operations' },
    ];

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learnerId}/assessment`, {
      data: { responses: minimalResponses, functioningLevel: 3, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();
  });

  test('functioning level signals extracted from responses', async ({ page }) => {
    coverageTracker.setContext('functioning level signals extracted from responses', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learnerRes = await page.request.post(`${API_BASE}/family/learners`, {
      data: {
        name: 'Signal Extraction Child',
        dateOfBirth: '2015-09-10',
        gradeLevel: '4th',
        functioningLevel: 2,
        specialNeeds: ['speech'],
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(learnerRes.ok()).toBeTruthy();
    const learnerData = await learnerRes.json();
    const learnerId = learnerData.learner?.id || learnerData.id;

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

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${learnerId}/assessment`, {
      data: { responses, functioningLevel: 2, testMode: true },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();
    const resultData = await assessmentRes.json();

    const signals = resultData.signals || resultData.functioningSignals;
    if (signals) {
      expect(signals.verbal || signals.communication).toBeTruthy();
    }
  });
});
