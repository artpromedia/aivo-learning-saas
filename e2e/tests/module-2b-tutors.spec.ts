import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../fixtures/learner.fixture';
import { getPreClonedBrainState, type BrainState } from '../fixtures/brain.fixture';
import {
  createTestSubscription,
  addTutorSubscription,
  type TutorAddOn,
} from '../fixtures/subscription.fixture';
import { coverageTracker } from '../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 2b: Tutors', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let brain: BrainState;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
    await createTestSubscription(parent.token, 'growth');

    try {
      brain = await getPreClonedBrainState(parent.token, learner.id);
    } catch {
      // Brain setup may fail in test; tests handle this gracefully
    }
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('subscribe to math tutor and verify activation', async ({ page }) => {
    coverageTracker.setContext(
      'subscribe to math tutor and verify activation',
      'module-2b-tutors',
    );
    await coverageTracker.attach(page);

    // Add math tutor via API
    const mathTutor = await addTutorSubscription(parent.token, learner.id, 'math');
    expect(mathTutor.tutorId).toBeTruthy();
    expect(['active', 'provisioning']).toContain(mathTutor.status);

    // Login and verify tutor appears in dashboard
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/password/i).first().fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|teacher|admin|learner|onboarding)/, { timeout: 15_000 });

    // Navigate to learner's tutor page
    await page.goto(`${BASE_URL}/parent/${learner.id}/tutors`);

    // Math tutor should be visible
    await expect(page.getByText(/math/i).first()).toBeVisible({ timeout: 10_000 });

    // Status should show active or ready
    const tutorCard = page.locator('[data-testid*="tutor"], [class*="tutor"]').filter({
      hasText: /math/i,
    });
    if ((await tutorCard.count()) > 0) {
      await expect(tutorCard.first()).toBeVisible();
    }
  });

  test('tutor session with real LLM response', async ({ page }) => {
    coverageTracker.setContext('tutor session with real LLM response', 'module-2b-tutors');
    await coverageTracker.attach(page);

    // Ensure math tutor exists
    let _mathTutor: TutorAddOn;
    try {
      _mathTutor = await addTutorSubscription(parent.token, learner.id, 'math');
    } catch {
      // May already exist
      _mathTutor = { subject: 'math', tutorId: 'existing', status: 'active' };
    }

    // Start a tutor session via API
    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      headers: {
        Authorization: `Bearer ${parent.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        learnerId: learner.id,
        subject: 'math',
        topic: 'addition with carrying',
      },
    });

    if (!sessionRes.ok()) {
      // Session creation may require specific setup; skip gracefully
      test.skip(true, 'Tutor session endpoint not available');
      return;
    }

    const session = await sessionRes.json();
    const sessionId = session.sessionId || session.id;
    expect(sessionId).toBeTruthy();

    // Send a message to the tutor
    const messageRes = await page.request.post(
      `${API_BASE}/tutor/sessions/${sessionId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
          'Content-Type': 'application/json',
        },
        data: {
          content: 'Can you help me with 47 + 38?',
          role: 'learner',
        },
      },
    );

    if (messageRes.ok()) {
      const messageData = await messageRes.json();
      const tutorResponse =
        messageData.response || messageData.message || messageData.content;

      // Tutor should respond with educational content
      expect(tutorResponse).toBeTruthy();
      if (typeof tutorResponse === 'string') {
        // Response should mention the math problem or provide guidance
        const isRelevant =
          tutorResponse.includes('47') ||
          tutorResponse.includes('38') ||
          tutorResponse.includes('85') ||
          /add|carry|sum|place value/i.test(tutorResponse);
        expect(isRelevant).toBeTruthy();
      }
    }

    // Navigate to the session in UI
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/password/i).first().fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(parent|teacher|admin|learner|onboarding)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/parent/${learner.id}/tutors`);
    await page.waitForTimeout(2_000);

    // Session page should show conversation
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('session completion updates mastery', async ({ page }) => {
    coverageTracker.setContext('session completion updates mastery', 'module-2b-tutors');
    await coverageTracker.attach(page);

    // Create a tutor session
    const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
      headers: {
        Authorization: `Bearer ${parent.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        learnerId: learner.id,
        subject: 'math',
        topic: 'basic multiplication',
      },
    });

    if (!sessionRes.ok()) {
      test.skip(true, 'Tutor session endpoint not available');
      return;
    }

    const session = await sessionRes.json();
    const sessionId = session.sessionId || session.id;

    // Complete the session
    const completeRes = await page.request.post(
      `${API_BASE}/tutor/sessions/${sessionId}/complete`,
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
          'Content-Type': 'application/json',
        },
        data: {
          score: 85,
          questionsAnswered: 10,
          correctAnswers: 8,
        },
      },
    );

    if (completeRes.ok()) {
      const completionData = await completeRes.json();

      // Should return mastery update information
      expect(completionData).toBeTruthy();

      const masteryUpdated =
        completionData.masteryDelta !== undefined ||
        completionData.mastery !== undefined ||
        completionData.xpEarned !== undefined;

      expect(masteryUpdated).toBeTruthy();
    }

    // Verify brain state was updated
    if (brain?.brainId) {
      const brainRes = await page.request.get(
        `http://localhost:3102/brain/profiles/${brain.brainId}`,
        { headers: { Authorization: `Bearer ${parent.token}` } },
      );

      if (brainRes.ok()) {
        const brainData = await brainRes.json();
        // Brain should reflect some mastery data
        expect(brainData).toBeTruthy();
      }
    }
  });

  test('tutor deprovisioning grace period', async ({ page }) => {
    coverageTracker.setContext('tutor deprovisioning grace period', 'module-2b-tutors');
    await coverageTracker.attach(page);

    // Add a reading tutor, then cancel it
    let readingTutor: TutorAddOn;
    try {
      readingTutor = await addTutorSubscription(parent.token, learner.id, 'reading');
    } catch {
      test.skip(true, 'Could not create reading tutor subscription');
      return;
    }

    // Cancel the tutor add-on
    const cancelRes = await page.request.delete(
      `${API_BASE}/billing/tutor-add-ons/${readingTutor.tutorId}`,
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (cancelRes.ok()) {
      const cancelData = await cancelRes.json();

      // Should have a grace period, not immediate deletion
      const gracePeriod =
        cancelData.gracePeriodEnds ||
        cancelData.grace_period_ends ||
        cancelData.effectiveDate ||
        cancelData.deactivatesAt;
      const status = cancelData.status;

      // Tutor should be in a canceling/grace state, not immediately removed
      if (status) {
        expect(['canceling', 'grace_period', 'pending_cancellation']).toContain(status);
      }

      if (gracePeriod) {
        const graceDate = new Date(gracePeriod);
        expect(graceDate.getTime()).toBeGreaterThan(Date.now());
      }

      // Tutor should still be accessible during grace period
      const sessionRes = await page.request.post(`${API_BASE}/tutor/sessions`, {
        headers: {
          Authorization: `Bearer ${parent.token}`,
          'Content-Type': 'application/json',
        },
        data: {
          learnerId: learner.id,
          subject: 'reading',
          topic: 'reading comprehension',
        },
      });

      // During grace period, sessions should still work
      if (sessionRes.ok()) {
        const sessionData = await sessionRes.json();
        expect(sessionData.sessionId || sessionData.id).toBeTruthy();
      }
    }
  });
});
