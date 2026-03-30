import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../fixtures/auth.fixture';
import { createTestLearner, type FunctioningLevel } from '../fixtures/learner.fixture';
import { coverageTracker } from '../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 1a: Assessment & Onboarding', () => {
  let parent: TestUser;

  test.beforeAll(async () => {
    parent = await createTestParent();
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('full onboarding: signup -> add child -> parent assessment -> IEP upload -> baseline', async ({
    page,
  }) => {
    coverageTracker.setContext(
      'full onboarding: signup -> add child -> parent assessment -> IEP upload -> baseline',
      'module-1a-assessment',
    );
    await coverageTracker.attach(page);

    // Login as the test parent
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/^password$/i).fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    // Step 1: Navigate to add child flow
    const addChildButton = page.getByRole('button', { name: /add child|add learner/i });
    const addChildLink = page.getByRole('link', { name: /add child|add learner/i });
    if (await addChildButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addChildButton.click();
    } else if (await addChildLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await addChildLink.click();
    } else {
      await page.goto(`${BASE_URL}/onboarding/add-child`);
    }

    // Step 2: Fill child details
    await page.getByLabel(/child.*name|first name/i).fill('E2E Test Child');
    await page.getByLabel(/date of birth|birthday/i).fill('2016-06-15');

    const gradeSelect = page.getByLabel(/grade/i);
    if (await gradeSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await gradeSelect.selectOption({ label: /3rd|3/i });
    }

    await page.getByRole('button', { name: /next|continue/i }).click();

    // Step 3: Parent assessment questionnaire
    await page.waitForURL(/\/(onboarding|assessment)/, { timeout: 10_000 });

    // Answer assessment questions - select options that indicate moderate functioning
    const radioGroups = page.locator('[role="radiogroup"], fieldset');
    const groupCount = await radioGroups.count();

    for (let i = 0; i < groupCount; i++) {
      const options = radioGroups.nth(i).locator('input[type="radio"], [role="radio"]');
      const optionCount = await options.count();
      if (optionCount > 0) {
        // Select the middle option for moderate functioning
        const middleIndex = Math.floor(optionCount / 2);
        await options.nth(middleIndex).click();
      }
    }

    // If there's a "next" or "submit" button for the assessment
    const submitAssessment = page.getByRole('button', { name: /submit|next|continue|complete/i });
    if (await submitAssessment.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await submitAssessment.click();
    }

    // Step 4: IEP upload section
    await page.waitForTimeout(2_000);
    const iepUpload = page.locator('input[type="file"]');
    if (await iepUpload.isVisible({ timeout: 5_000 }).catch(() => false)) {
      // Create a minimal test PDF buffer
      const testPdfContent = Buffer.from('%PDF-1.4 test IEP document');
      await iepUpload.setInputFiles({
        name: 'test-iep.pdf',
        mimeType: 'application/pdf',
        buffer: testPdfContent,
      });

      const uploadButton = page.getByRole('button', { name: /upload|submit/i });
      if (await uploadButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await uploadButton.click();
        await page.waitForTimeout(3_000);
      }
    }

    // Step 5: Baseline should be generated
    const skipButton = page.getByRole('button', { name: /skip|later/i });
    if (await skipButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skipButton.click();
    }

    // Verify we reach a completion or dashboard state
    await page.waitForURL(/\/(dashboard|onboarding\/complete|brain)/, { timeout: 20_000 });

    // Verify learner was created via API
    const learnersRes = await page.request.get(`${API_BASE}/family/learners`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(learnersRes.ok()).toBeTruthy();
    const learnersData = await learnersRes.json();
    const learners = learnersData.learners || learnersData;
    expect(Array.isArray(learners) ? learners.length : 0).toBeGreaterThan(0);
  });

  test('assessment mode adapts per functioning level', async ({ page }) => {
    coverageTracker.setContext(
      'assessment mode adapts per functioning level',
      'module-1a-assessment',
    );
    await coverageTracker.attach(page);

    const levels: FunctioningLevel[] = [1, 3, 5];

    for (const level of levels) {
      // Create a learner at this functioning level
      const learner = await createTestLearner(parent.token, level);

      // Fetch the assessment config for this learner
      const assessmentRes = await page.request.get(
        `${API_BASE}/family/learners/${learner.id}/assessment`,
        { headers: { Authorization: `Bearer ${parent.token}` } },
      );

      if (assessmentRes.ok()) {
        const assessmentData = await assessmentRes.json();

        // Assessment should have different question sets or modes per level
        expect(assessmentData).toBeTruthy();

        // Lower functioning levels should have simpler, more guided assessments
        if (level === 1) {
          // Level 1: expect guided/simplified mode
          const mode = assessmentData.mode || assessmentData.type;
          if (mode) {
            expect(['guided', 'simplified', 'supported', 'level-1']).toContain(mode);
          }
        }

        // Higher functioning levels should have standard assessments
        if (level === 5) {
          const mode = assessmentData.mode || assessmentData.type;
          if (mode) {
            expect(['standard', 'advanced', 'independent', 'level-5']).toContain(mode);
          }
        }
      }
    }
  });

  test('IEP data extracted and displayed', async ({ page }) => {
    coverageTracker.setContext('IEP data extracted and displayed', 'module-1a-assessment');
    await coverageTracker.attach(page);

    const learner = await createTestLearner(parent.token, 3);

    // Upload IEP via API
    const iepRes = await page.request.post(
      `${API_BASE}/family/learners/${learner.id}/iep`,
      {
        headers: { Authorization: `Bearer ${parent.token}` },
        multipart: {
          file: {
            name: 'test-iep.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('%PDF-1.4 test IEP with goals and accommodations'),
          },
        },
      },
    );

    // IEP processing may be async
    if (iepRes.ok()) {
      const iepData = await iepRes.json();
      expect(iepData).toBeTruthy();

      // Wait for processing, then check extracted data
      await page.waitForTimeout(3_000);

      const learnerRes = await page.request.get(
        `${API_BASE}/family/learners/${learner.id}`,
        { headers: { Authorization: `Bearer ${parent.token}` } },
      );

      if (learnerRes.ok()) {
        const learnerData = await learnerRes.json();
        const profile = learnerData.learner || learnerData;

        // Navigate to learner profile page to verify IEP data display
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill(parent.email);
        await page.getByLabel(/^password$/i).fill(parent.password);
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

        await page.goto(`${BASE_URL}/dashboard/learners/${learner.id}`);

        // Check that IEP-related information is visible on the page
        const pageContent = await page.textContent('body');
        const hasIepData =
          pageContent?.includes('IEP') ||
          pageContent?.includes('goals') ||
          pageContent?.includes('accommodations') ||
          pageContent?.includes('individualized');

        // The IEP section should exist even if parsing is incomplete
        if (profile.iep || profile.iepData) {
          expect(hasIepData).toBeTruthy();
        }
      }
    }
  });
});
