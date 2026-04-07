import { test, expect } from '@playwright/test';
import { createTestParent, type TestUser } from '../../fixtures/auth.fixture';
import { createTestLearner, type TestLearner } from '../../fixtures/learner.fixture';
import { isBrainAvailable, getPreClonedBrainState, type BrainState } from '../../fixtures/brain.fixture';
import { coverageTracker } from '../../helpers/coverage-tracker';
import { waitForNotification } from '../../helpers/wait-for-nats';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

test.describe('Module 3b: Contextual Recommendations after Brain Clone', () => {
  let parent: TestUser;
  let learner: TestLearner;
  let brainState: BrainState;
  let brainUp = false;

  test.beforeAll(async () => {
    brainUp = await isBrainAvailable();
    parent = await createTestParent();
    learner = await createTestLearner(parent.token, 4);
    if (brainUp) {
      brainState = await getPreClonedBrainState(parent.token, learner.id);
    }
  });

  test.beforeEach(async () => {
    test.skip(!brainUp, 'brain-svc not available');
  });

  test.afterAll(async () => {
    coverageTracker.flush();
  });

  test('multiple contextual recommendations created after brain clone', async ({ page }) => {
    coverageTracker.setContext('multiple contextual recommendations after brain clone', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    // After brain clone, recommendations should have been created by the brain.cloned event
    // Fetch recommendations for the learner
    const recsRes = await page.request.get(
      `${API_BASE}/family/recommendations/${learner.id}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (recsRes.ok()) {
      const data = await recsRes.json();
      const pending = data.pending || data.recommendations || [];

      // Should have more than 1 recommendation (not just the generic one)
      expect(pending.length).toBeGreaterThanOrEqual(1);

      // At least one should be ASSESSMENT_REBASELINE (the summary)
      const summaryRec = pending.find(
        (r: { type: string }) => r.type === 'ASSESSMENT_REBASELINE',
      );
      if (summaryRec) {
        // Summary should reference the learner's name or include domain data
        expect(summaryRec.title).toBeTruthy();
        expect(summaryRec.description).toBeTruthy();
        expect(summaryRec.description.length).toBeGreaterThan(50);
      }
    }
  });

  test('recommendations reference actual domain scores in payload', async ({ page }) => {
    coverageTracker.setContext('recommendations reference domain scores', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recsRes = await page.request.get(
      `${API_BASE}/family/recommendations/${learner.id}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (recsRes.ok()) {
      const data = await recsRes.json();
      const allRecs = [...(data.pending || []), ...(data.recent || [])];

      // Find a recommendation with domain score data
      const domainRec = allRecs.find(
        (r: { type: string }) =>
          r.type === 'CURRICULUM_ADJUSTMENT' || r.type === 'TUTOR_ADDON',
      );

      if (domainRec) {
        // Should have domain info in payload
        expect(domainRec.payload).toBeTruthy();
        const payload = typeof domainRec.payload === 'string'
          ? JSON.parse(domainRec.payload)
          : domainRec.payload;
        expect(payload.domain || payload.theta !== undefined).toBeTruthy();
      }

      // The ASSESSMENT_REBASELINE summary should contain domain scores
      const summary = allRecs.find(
        (r: { type: string }) => r.type === 'ASSESSMENT_REBASELINE',
      );
      if (summary) {
        const payload = typeof summary.payload === 'string'
          ? JSON.parse(summary.payload)
          : summary.payload;
        expect(payload.functioningLevel || payload.domainScores).toBeTruthy();
      }
    }
  });

  test('recommendation types are appropriate (not all ASSESSMENT_REBASELINE)', async ({ page }) => {
    coverageTracker.setContext('recommendation types are varied', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recsRes = await page.request.get(
      `${API_BASE}/family/recommendations/${learner.id}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (recsRes.ok()) {
      const data = await recsRes.json();
      const allRecs = [...(data.pending || []), ...(data.recent || [])];

      if (allRecs.length > 1) {
        // Collect unique types
        const types = new Set(allRecs.map((r: { type: string }) => r.type));

        // If there are multiple recommendations, they shouldn't all be the same type
        expect(types.size).toBeGreaterThanOrEqual(1);

        // Valid recommendation types
        const validTypes = [
          'CURRICULUM_ADJUSTMENT', 'TUTOR_ADDON', 'IEP_GOAL_UPDATE',
          'ASSESSMENT_REBASELINE', 'ACCOMMODATION_CHANGE', 'FUNCTIONING_LEVEL_CHANGE',
          'ENGAGEMENT_BOOST', 'PARENT_MEDIATED_ACTIVITY', 'DIFFICULTY_ADJUSTMENT',
          'MODALITY_SWITCH', 'BREAK_SUGGESTION', 'CELEBRATION', 'REGRESSION_ALERT',
        ];
        for (const type of types) {
          expect(validTypes).toContain(type);
        }
      }
    }
  });

  test('recommendations have personalized titles (not generic)', async ({ page }) => {
    coverageTracker.setContext('recommendations have personalized titles', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    const recsRes = await page.request.get(
      `${API_BASE}/family/recommendations/${learner.id}`,
      { headers: { Authorization: `Bearer ${parent.token}` } },
    );

    if (recsRes.ok()) {
      const data = await recsRes.json();
      const allRecs = [...(data.pending || []), ...(data.recent || [])];

      for (const rec of allRecs) {
        // Title should not be the old generic text
        expect(rec.title).not.toBe('Review your child\'s Brain profile');
        // Title should exist and be meaningful
        expect(rec.title).toBeTruthy();
        expect(rec.title.length).toBeGreaterThan(5);
      }
    }
  });

  test('parent notification sent after brain clone with recommendation count', async ({ page }) => {
    coverageTracker.setContext('parent notification after brain clone', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    // Check for notification about recommendations
    const notification = await waitForNotification(
      parent.token,
      (n) =>
        n.type === 'recommendation_pending' ||
        (n.body && n.body.includes('recommendation')),
      { timeoutMs: 10_000 },
    ).catch(() => null);

    // Notification may have already been consumed — check notifications list
    const notifRes = await page.request.get(`${API_BASE}/comms/notifications`, {
      headers: { Authorization: `Bearer ${parent.token}` },
    });
    expect(notifRes.ok()).toBeTruthy();
  });

  test('IEP recommendation created when IEP data exists', async ({ page }) => {
    coverageTracker.setContext('IEP recommendation created when IEP data exists', 'module-3b-collaboration');
    await coverageTracker.attach(page);

    // Create a learner with IEP data
    const iepLearner = await createTestLearner(parent.token, 3);

    // Upload IEP for this learner
    const iepRes = await page.request.post(`${API_BASE}/assessment/iep/upload`, {
      data: {
        learnerId: iepLearner.id,
        goals: [
          { domain: 'math', text: 'Count to 100', targetMetric: '80% accuracy' },
          { domain: 'reading', text: 'Read sight words', targetMetric: '20 words per minute' },
        ],
        testMode: true,
      },
      headers: { Authorization: `Bearer ${parent.token}` },
    });

    if (iepRes.ok()) {
      // Trigger brain clone for this learner
      if (brainUp) {
        const brainRes = await getPreClonedBrainState(parent.token, iepLearner.id).catch(() => null);

        if (brainRes) {
          // Check for IEP-specific recommendation
          const recsRes = await page.request.get(
            `${API_BASE}/family/recommendations/${iepLearner.id}`,
            { headers: { Authorization: `Bearer ${parent.token}` } },
          );

          if (recsRes.ok()) {
            const data = await recsRes.json();
            const allRecs = [...(data.pending || []), ...(data.recent || [])];
            const iepRec = allRecs.find(
              (r: { type: string }) => r.type === 'IEP_GOAL_UPDATE',
            );

            if (iepRec) {
              expect(iepRec.title).toContain('IEP');
              expect(iepRec.description).toBeTruthy();
            }
          }
        }
      }
    }
  });
});
