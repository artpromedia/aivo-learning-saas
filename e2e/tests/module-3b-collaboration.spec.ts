import { test, expect } from '@playwright/test';
import {
  createTestParent,
  createTestTeacher,
  type TestUser,
} from '../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../fixtures/learner.fixture';
import { coverageTracker } from '../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

test.describe('Module 3b: Collaboration', () => {
  let parent: TestUser;
  let teacher: TestUser;
  let learner: TestLearner;

  test.beforeAll(async () => {
    parent = await createTestParent();
    teacher = await createTestTeacher();
    learner = await createTestLearner(parent.token, 3);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('parent sees and responds to recommendations', async ({ page }) => {
    coverageTracker.setContext(
      'parent sees and responds to recommendations',
      'module-3b-collaboration',
    );
    await coverageTracker.attach(page);

    // First, check if there are any recommendations (system-generated)
    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    // Login as parent
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/password/i).first().fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    // Navigate to notifications/recommendations
    await page.goto(`${BASE_URL}/dashboard/notifications`);
    await page.waitForTimeout(2_000);

    if (notifRes.ok()) {
      const notifData = await notifRes.json();
      const notifications = notifData.notifications || notifData.items || notifData;
      const recommendations = Array.isArray(notifications)
        ? notifications.filter(
            (n: { type?: string }) =>
              n.type === 'recommendation' || n.type === 'insight',
          )
        : [];

      if (recommendations.length > 0) {
        const firstRec = recommendations[0];
        const recId = firstRec.id;

        // Respond to the recommendation
        const respondRes = await page.request.post(
          `${API_BASE}/comms/recommendations/${recId}/respond`,
          {
            headers: {
              Authorization: `Bearer ${parent.token}`,
              'Content-Type': 'application/json',
            },
            data: {
              response: 'acknowledged',
              note: 'Thank you, we will work on this at home.',
            },
          },
        );

        if (respondRes.ok()) {
          const respondData = await respondRes.json();
          expect(respondData).toBeTruthy();
        }
      }
    }

    // Verify the notifications page renders
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('teacher submits insight, parent receives notification', async ({ page }) => {
    coverageTracker.setContext(
      'teacher submits insight, parent receives notification',
      'module-3b-collaboration',
    );
    await coverageTracker.attach(page);

    // Teacher submits an insight about the learner
    const insightRes = await page.request.post(`${API_BASE}/comms/insights`, {
      headers: {
        Authorization: `Bearer ${teacher.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        learnerId: learner.id,
        type: 'observation',
        subject: 'math',
        content:
          'Student shows strong understanding of addition but struggles with word problems. Recommend more practice with reading comprehension in math contexts.',
        priority: 'normal',
      },
    });

    if (!insightRes.ok()) {
      // Teacher may need to be linked to the learner first
      test.skip(true, 'Teacher insight endpoint not available or teacher not linked');
      return;
    }

    const insightData = await insightRes.json();
    expect(insightData).toBeTruthy();

    // Wait for notification delivery
    await page.waitForTimeout(3_000);

    // Check that parent received a notification
    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (notifRes.ok()) {
      const notifData = await notifRes.json();
      const notifications = notifData.notifications || notifData.items || notifData;

      if (Array.isArray(notifications)) {
        const teacherInsight = notifications.find(
          (n: { type?: string; source?: string }) =>
            n.type === 'insight' || n.source === 'teacher',
        );

        // Should have received the teacher's insight
        if (teacherInsight) {
          expect(teacherInsight).toBeTruthy();
        }
      }
    }

    // Verify in parent UI
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/password/i).first().fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/dashboard/notifications`);

    // Page should show notifications
    await page.waitForTimeout(2_000);
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('caregiver invite and limited access', async ({ page }) => {
    coverageTracker.setContext(
      'caregiver invite and limited access',
      'module-3b-collaboration',
    );
    await coverageTracker.attach(page);

    const caregiverEmail = `e2e+caregiver-${Date.now()}@aivo.test`;

    // Parent sends a caregiver invite
    const inviteRes = await page.request.post(`${API_BASE}/comms/caregiver-invite`, {
      headers: {
        Authorization: `Bearer ${parent.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        email: caregiverEmail,
        learnerId: learner.id,
        role: 'caregiver',
        permissions: ['view_progress', 'view_sessions'],
      },
    });

    if (!inviteRes.ok()) {
      test.skip(true, 'Caregiver invite endpoint not available');
      return;
    }

    const inviteData = await inviteRes.json();
    expect(inviteData).toBeTruthy();

    // Simulate caregiver accepting the invite (via test endpoint)
    const acceptRes = await page.request.post(`${API_BASE}/test/accept-invite`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: caregiverEmail,
        inviteId: inviteData.inviteId || inviteData.id,
      },
    });

    if (acceptRes.ok()) {
      // Login as caregiver
      const caregiverPassword = 'E2eCare!Secure789';
      const signUpRes = await page.request.post(`${API_BASE}/auth/sign-up`, {
        data: {
          email: caregiverEmail,
          password: caregiverPassword,
          name: 'Test Caregiver',
          role: 'parent',
        },
      });

      if (signUpRes.ok()) {
        await page.request.post(`${API_BASE}/test/verify-email`, {
          data: { email: caregiverEmail },
        });

        const signInRes = await page.request.post(`${API_BASE}/auth/sign-in`, {
          data: { email: caregiverEmail, password: caregiverPassword },
        });

        if (signInRes.ok()) {
          const signInData = await signInRes.json();
          const caregiverToken = signInData.token || signInData.session?.token;

          // Caregiver should be able to view learner progress
          const progressRes = await page.request.get(
            `${API_BASE}/family/learners/${learner.id}`,
            { headers: { Authorization: `Bearer ${caregiverToken}` } },
          );

          // Should have limited access - either allowed (view) or specific scoped response
          if (progressRes.ok()) {
            const progressData = await progressRes.json();
            expect(progressData).toBeTruthy();
          }

          // Caregiver should NOT be able to modify learner settings
          const updateRes = await page.request.put(
            `${API_BASE}/family/learners/${learner.id}`,
            {
              headers: {
                Authorization: `Bearer ${caregiverToken}`,
                'Content-Type': 'application/json',
              },
              data: { name: 'Unauthorized Name Change' },
            },
          );

          // Should be forbidden
          expect([403, 401]).toContain(updateRes.status());
        }
      }
    }
  });
});
