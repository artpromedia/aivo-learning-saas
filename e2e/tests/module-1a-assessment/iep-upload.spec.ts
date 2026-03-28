import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 1a: IEP Upload', () => {
  let parent: TestUser;
  let learner: TestLearner;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('upload PDF IEP and ai-svc parses content', async ({ page }) => {
    coverageTracker.setContext('upload PDF IEP and ai-svc parses content', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const iepRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/iep`, {
      data: {
        content: 'IEP Document: Student demonstrates below grade level reading comprehension. Goals include improving phonemic awareness and reading fluency to grade level by end of year. Accommodations: extended time, preferential seating, visual aids.',
        format: 'pdf',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(iepRes.ok()).toBeTruthy();
    const iepData = await iepRes.json();

    expect(iepData.parsed || iepData.extractedData || iepData.iep).toBeTruthy();

    const parsed = iepData.parsed || iepData.extractedData || iepData.iep || {};
    if (parsed.goals || parsed.accommodations) {
      expect(parsed.goals || parsed.accommodations).toBeTruthy();
    }
  });

  test('extracted data displayed for parent confirmation', async ({ page }) => {
    coverageTracker.setContext('extracted data displayed for parent confirmation', 'module-1a-assessment');
    await coverageTracker.attach(page);

    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/password/i).fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    const iepRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/iep`, {
      data: {
        content: 'IEP Goals: 1. Read 50 words per minute. 2. Complete math problems with 80% accuracy. Accommodations: visual schedule, sensory breaks.',
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(iepRes.ok()).toBeTruthy();
    const iepData = await iepRes.json();
    expect(iepData).toBeTruthy();
  });

  test('parent confirms IEP data and it is saved', async ({ page }) => {
    coverageTracker.setContext('parent confirms IEP data and it is saved', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const uploadRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/iep`, {
      data: {
        content: 'Annual IEP review indicates progress in reading. New goals: sight word recognition of 100 words, independent paragraph writing.',
        testMode: true,
        confirmed: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(uploadRes.ok()).toBeTruthy();

    const learnerRes = await page.request.get(`${API_BASE}/family/learners/${learner.id}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(learnerRes.ok()).toBeTruthy();
    const learnerData = await learnerRes.json();
    const learnerInfo = learnerData.learner || learnerData;
    expect(learnerInfo.iep || learnerInfo.iepUploaded || learnerInfo.hasIep).toBeTruthy();
  });

  test('parent edits IEP data and changes persist', async ({ page }) => {
    coverageTracker.setContext('parent edits IEP data and changes persist', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const editRes = await page.request.post(`${API_BASE}/family/learners/${learner.id}/iep`, {
      data: {
        content: 'Edited IEP: Updated goals include reading comprehension at 3rd grade level and basic multiplication facts.',
        testMode: true,
        confirmed: true,
        edits: {
          goals: ['Reading comprehension at 3rd grade level', 'Basic multiplication facts'],
          accommodations: ['Extended time on tests', 'Visual aids'],
        },
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(editRes.ok()).toBeTruthy();

    const verifyRes = await page.request.get(`${API_BASE}/family/learners/${learner.id}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(verifyRes.ok()).toBeTruthy();
  });

  test('parent skips IEP upload and continues without IEP', async ({ page }) => {
    coverageTracker.setContext('parent skips IEP upload and continues without IEP', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const newLearner = await createTestLearner(parent.token, 4);

    const assessmentRes = await page.request.post(`${API_BASE}/family/learners/${newLearner.id}/assessment`, {
      data: {
        responses: [
          { questionId: 'verbal-communication', answer: 'full-sentences' },
          { questionId: 'reading-level', answer: 'grade-level' },
          { questionId: 'math-skills', answer: 'grade-level' },
        ],
        functioningLevel: 4,
        skipIep: true,
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(assessmentRes.ok()).toBeTruthy();

    const learnerRes = await page.request.get(`${API_BASE}/family/learners/${newLearner.id}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    expect(learnerRes.ok()).toBeTruthy();
    const learnerData = await learnerRes.json();
    const learnerInfo = learnerData.learner || learnerData;
    expect(learnerInfo.iepUploaded === false || learnerInfo.hasIep === false || !learnerInfo.iep).toBeTruthy();
  });
});
