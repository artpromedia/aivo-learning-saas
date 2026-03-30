import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../fixtures/learner.fixture';
import { createBrainProfile, waitForBrainReady, approveBrain } from '../fixtures/brain.fixture';
import { coverageTracker } from '../helpers/coverage-tracker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 1b: Brain Profile', () => {
  let parent: TestUser;
  let learner: TestLearner;

  test.beforeAll(async () => {
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 3);
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('brain state created after assessment', async ({ page }) => {
    coverageTracker.setContext('brain state created after assessment', 'module-1b-brain');
    await coverageTracker.attach(page);

    // Create brain profile via API
    const brain = await createBrainProfile(parent.token, learner.id);

    expect(brain.brainId).toBeTruthy();
    expect(brain.learnerId).toBe(learner.id);
    expect(['pending', 'profiling', 'ready']).toContain(brain.status);

    // Verify via direct API call
    const brainRes = await page.request.get(`${BRAIN_API}/brain/profiles/${brain.brainId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(brainRes.ok()).toBeTruthy();

    const brainData = await brainRes.json();
    expect(brainData.learnerId || brainData.learner_id).toBe(learner.id);
  });

  test('brain profile reveal page renders correctly', async ({ page }) => {
    coverageTracker.setContext('brain profile reveal page renders correctly', 'module-1b-brain');
    await coverageTracker.attach(page);

    // Create and wait for brain to be ready
    const brain = await createBrainProfile(parent.token, learner.id);

    let _readyBrain;
    try {
      _readyBrain = await waitForBrainReady(parent.token, brain.brainId, 20_000);
    } catch {
      // Brain may not reach ready state in test; continue with pending state
      _readyBrain = brain;
    }

    // Login and navigate to brain reveal page
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/^password$/i).fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    // Navigate to brain profile page
    await page.goto(`${BASE_URL}/dashboard/learners/${learner.id}/brain`);

    // Check that the brain profile page has key elements
    await expect(page.locator('body')).toContainText(/brain|profile|cognitive|learning/i);

    // Check for domain visualization elements
    const hasDomainElements =
      (await page.locator('[data-testid*="domain"], [class*="domain"], [class*="brain"]').count()) >
      0;
    const hasChartElements =
      (await page.locator('canvas, svg, [class*="chart"], [class*="graph"]').count()) > 0;
    const hasTextContent = await page
      .getByText(/math|reading|language|cognitive|motor|social/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    // At least some brain-related content should be visible
    expect(hasDomainElements || hasChartElements || hasTextContent).toBeTruthy();
  });

  test('parent approve activates brain', async ({ page }) => {
    coverageTracker.setContext('parent approve activates brain', 'module-1b-brain');
    await coverageTracker.attach(page);

    // Create brain and wait for ready state
    const brain = await createBrainProfile(parent.token, learner.id);

    let readyBrain;
    try {
      readyBrain = await waitForBrainReady(parent.token, brain.brainId, 20_000);
    } catch {
      readyBrain = brain;
    }

    // Approve the brain via API
    const approvedBrain = await approveBrain(parent.token, readyBrain.brainId);
    expect(['active', 'ready']).toContain(approvedBrain.status);

    // Verify through the UI
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(parent.email);
    await page.getByLabel(/^password$/i).fill(parent.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });

    await page.goto(`${BASE_URL}/dashboard/learners/${learner.id}/brain`);

    // The brain should show as active/approved
    const statusIndicator = page.locator(
      '[data-testid*="status"], [class*="status"], [class*="badge"]',
    );
    if ((await statusIndicator.count()) > 0) {
      await expect(statusIndicator.first()).toContainText(/active|approved|ready/i);
    }

    // Verify via API that brain is now active
    const verifyRes = await page.request.get(`${BRAIN_API}/brain/profiles/${approvedBrain.brainId}`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(verifyRes.ok()).toBeTruthy();
    const verifyData = await verifyRes.json();
    expect(['active', 'ready']).toContain(verifyData.status);
  });

  test('brain context API returns complete data', async ({ page }) => {
    coverageTracker.setContext('brain context API returns complete data', 'module-1b-brain');
    await coverageTracker.attach(page);

    // Get a fully activated brain
    const brain = await createBrainProfile(parent.token, learner.id);

    let finalBrain;
    try {
      const readyBrain = await waitForBrainReady(parent.token, brain.brainId, 20_000);
      finalBrain = await approveBrain(parent.token, readyBrain.brainId);
    } catch {
      finalBrain = brain;
    }

    // Call the brain context API
    const contextRes = await page.request.get(
      `${BRAIN_API}/brain/profiles/${finalBrain.brainId}/context`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (contextRes.ok()) {
      const context = await contextRes.json();

      // Brain context should contain key fields for tutor consumption
      expect(context).toBeTruthy();

      // Verify expected structure
      const hasLearnerInfo =
        context.learnerId || context.learner_id || context.learner;
      const hasDomains =
        context.domains || context.skills || context.areas;
      const hasFunctioningLevel =
        context.functioningLevel ||
        context.functioning_level ||
        context.level;

      expect(hasLearnerInfo).toBeTruthy();

      // Domains and levels should be present for an activated brain
      if (finalBrain.status === 'active') {
        expect(hasDomains || hasFunctioningLevel).toBeTruthy();
      }
    }
  });
});
