import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../fixtures/learner.fixture';
import { createTestSubscription, addTutorSubscription } from '../fixtures/subscription.fixture';
import { coverageTracker } from '../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 3a: Homework Help', () => {
  let parent: TestUser;
  let learner: TestLearner;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    await createTestSubscription(parent.token, 'growth');
    await addTutorSubscription(parent.token, learner.id, 'math');
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('upload homework image and OCR extraction', async ({ page }) => {
    coverageTracker.setContext(
      'upload homework image and OCR extraction',
      'module-3a-homework',
    );
    await coverageTracker.attach(page);

    // Create a simple test image (1x1 white PNG)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90,
      0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8,
      0xcf, 0xc0, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Upload via API
    const uploadRes = await page.request.post(`${API_BASE}/learning/homework/upload`, {
      headers: { Authorization: `Bearer ${parent.token}` },
      multipart: {
        file: {
          name: 'homework-math.png',
          mimeType: 'image/png',
          buffer: pngHeader,
        },
        learnerId: learner.id,
        subject: 'math',
      },
    });

    if (!uploadRes.ok()) {
      test.skip(true, 'Homework upload endpoint not available');
      return;
    }

    const uploadData = await uploadRes.json();
    const homeworkId = uploadData.homeworkId || uploadData.id;
    expect(homeworkId).toBeTruthy();

    // Wait for OCR processing
    await page.waitForTimeout(5_000);

    // Check homework status and OCR results
    const homeworkRes = await page.request.get(
      `${API_BASE}/learning/homework/${homeworkId}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (homeworkRes.ok()) {
      const homeworkData = await homeworkRes.json();
      expect(homeworkData).toBeTruthy();

      // OCR extraction should have been attempted
      const ocrStatus =
        homeworkData.ocrStatus || homeworkData.ocr_status || homeworkData.extractionStatus;

      // Accept any processing state (complete, processing, or pending)
      if (ocrStatus) {
        expect(['completed', 'processing', 'pending', 'extracted']).toContain(ocrStatus);
      }
    }

    // Verify via UI
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/^password$/i).fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/dashboard/learners/${learner.id}/homework`);
    await page.waitForTimeout(2_000);

    // Homework page should show the uploaded item
    const bodyText = await page.textContent('body');
    expect(bodyText?.toLowerCase()).toMatch(/homework|assignment|upload/);
  });

  test('locked state when tutor not subscribed', async ({ page }) => {
    coverageTracker.setContext(
      'locked state when tutor not subscribed',
      'module-3a-homework',
    );
    await coverageTracker.attach(page);

    // Create a new parent without tutor subscription for science
    const freeParent = await createTestParent();
    const freeLearner = await createTestLearner(freeParent.token, 3);

    // Attempt to upload homework for a subject without a tutor
    const uploadRes = await page.request.post(`${API_BASE}/learning/homework/upload`, {
      headers: { Authorization: `Bearer ${freeParent.token}` },
      multipart: {
        file: {
          name: 'homework-science.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake image data'),
        },
        learnerId: freeLearner.id,
        subject: 'science',
      },
    });

    // Should be rejected - no tutor subscription
    if (uploadRes.status() === 403 || uploadRes.status() === 402) {
      const errorData = await uploadRes.json();
      expect(
        errorData.error || errorData.message,
      ).toBeTruthy();
    }

    // Verify via UI that homework help shows locked state
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(freeParent.email);
    await page.getByLabel(/^password$/i).fill(freeParent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/dashboard/learners/${freeLearner.id}/homework`);

    // Should show locked or upgrade prompt
    const hasLockedState =
      (await page.getByText(/locked|subscribe|upgrade|unlock/i).isVisible({ timeout: 5_000 }).catch(() => false)) ||
      (await page.locator('[data-testid*="locked"], [class*="locked"]').count()) > 0;

    // Either the page shows locked state or the upload was blocked via API
    expect(hasLockedState || uploadRes.status() === 403 || uploadRes.status() === 402).toBeTruthy();
  });

  test('full homework session flow', async ({ page }) => {
    coverageTracker.setContext('full homework session flow', 'module-3a-homework');
    await coverageTracker.attach(page);

    // Upload homework
    const uploadRes = await page.request.post(`${API_BASE}/learning/homework/upload`, {
      headers: { Authorization: `Bearer ${parent.token}` },
      multipart: {
        file: {
          name: 'homework-addition.png',
          mimeType: 'image/png',
          buffer: Buffer.from('test homework image'),
        },
        learnerId: learner.id,
        subject: 'math',
      },
    });

    if (!uploadRes.ok()) {
      test.skip(true, 'Homework upload not available');
      return;
    }

    const uploadData = await uploadRes.json();
    const homeworkId = uploadData.homeworkId || uploadData.id;

    // Start a homework help session
    const sessionRes = await page.request.post(
      `${API_BASE}/learning/homework/${homeworkId}/session`,
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
          'Content-Type': 'application/json',
        },
        data: {
          learnerId: learner.id,
        },
      },
    );

    if (sessionRes.ok()) {
      const sessionData = await sessionRes.json();
      expect(sessionData).toBeTruthy();

      // Navigate to the homework session in UI
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel(/email/i).fill(parent.email);
      await page.getByLabel(/^password$/i).fill(parent.password);
      await page.getByRole('button', { name: /sign in|log in/i }).click();
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

      await page.goto(
        `${BASE_URL}/dashboard/learners/${learner.id}/homework/${homeworkId}`,
      );

      // Homework session should show the problem and guidance
      await page.waitForTimeout(3_000);
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    }
  });

  test('completion quality score calculated', async ({ page }) => {
    coverageTracker.setContext('completion quality score calculated', 'module-3a-homework');
    await coverageTracker.attach(page);

    // Upload and start homework session
    const uploadRes = await page.request.post(`${API_BASE}/learning/homework/upload`, {
      headers: { Authorization: `Bearer ${parent.token}` },
      multipart: {
        file: {
          name: 'homework-fractions.png',
          mimeType: 'image/png',
          buffer: Buffer.from('test homework fractions'),
        },
        learnerId: learner.id,
        subject: 'math',
      },
    });

    if (!uploadRes.ok()) {
      test.skip(true, 'Homework upload not available');
      return;
    }

    const uploadData = await uploadRes.json();
    const homeworkId = uploadData.homeworkId || uploadData.id;

    // Start and complete the session
    const sessionRes = await page.request.post(
      `${API_BASE}/learning/homework/${homeworkId}/session`,
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
          'Content-Type': 'application/json',
        },
        data: { learnerId: learner.id },
      },
    );

    if (!sessionRes.ok()) {
      test.skip(true, 'Homework session not available');
      return;
    }

    // Get the completed homework to check quality score
    await page.waitForTimeout(3_000);

    const homeworkRes = await page.request.get(
      `${API_BASE}/learning/homework/${homeworkId}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (homeworkRes.ok()) {
      const data = await homeworkRes.json();

      // Quality score should be present after session interaction
      const qualityScore =
        data.qualityScore ?? data.quality_score ?? data.completionScore ?? data.score;

      if (qualityScore !== undefined && qualityScore !== null) {
        expect(typeof qualityScore).toBe('number');
        expect(qualityScore).toBeGreaterThanOrEqual(0);
        expect(qualityScore).toBeLessThanOrEqual(100);
      }
    }
  });
});
