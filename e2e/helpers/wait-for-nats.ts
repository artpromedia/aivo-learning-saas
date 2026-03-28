import { APIRequestContext, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

export interface WaitOptions {
  pollIntervalMs?: number;
  timeoutMs?: number;
}

const DEFAULT_POLL_INTERVAL = 500;
const DEFAULT_TIMEOUT = 30_000;

async function createContext(baseURL: string, token: string): Promise<APIRequestContext> {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });
}

async function pollUntil<T>(
  fn: () => Promise<T | null>,
  options: WaitOptions = {},
): Promise<T> {
  const pollInterval = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL;
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await fn();
    if (result !== null) {
      return result;
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new Error(`Timed out waiting after ${timeout}ms`);
}

export async function waitForBrainCloned(
  parentToken: string,
  learnerId: string,
  options: WaitOptions = {},
): Promise<{ brainId: string; status: string }> {
  const ctx = await createContext(BRAIN_API, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/brain/profiles?learnerId=${learnerId}`);
    if (!res.ok()) return null;

    const data = await res.json();
    const profiles = Array.isArray(data) ? data : data.profiles || [];
    const active = profiles.find(
      (p: { status: string }) => p.status === 'ready' || p.status === 'active',
    );

    if (active) {
      return { brainId: active.brainId || active.id, status: active.status };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForBrainStatus(
  parentToken: string,
  brainId: string,
  expectedStatus: string,
  options: WaitOptions = {},
): Promise<{ brainId: string; status: string }> {
  const ctx = await createContext(BRAIN_API, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/brain/profiles/${brainId}`);
    if (!res.ok()) return null;

    const data = await res.json();
    if (data.status === expectedStatus) {
      return { brainId, status: data.status };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForTutorProvisioned(
  parentToken: string,
  tutorId: string,
  options: WaitOptions = {},
): Promise<{ tutorId: string; status: string }> {
  const ctx = await createContext(API_BASE, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/tutor/sessions?tutorId=${tutorId}`);
    if (!res.ok()) return null;

    const data = await res.json();
    if (data.status === 'active' || data.provisioned === true) {
      return { tutorId, status: 'active' };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForNotification(
  parentToken: string,
  matchFn: (notification: Record<string, unknown>) => boolean,
  options: WaitOptions = {},
): Promise<Record<string, unknown>> {
  const ctx = await createContext(API_BASE, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get('/comms/notifications');
    if (!res.ok()) return null;

    const data = await res.json();
    const notifications = Array.isArray(data) ? data : data.notifications || [];
    const match = notifications.find(matchFn);
    return match || null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForXpUpdate(
  parentToken: string,
  learnerId: string,
  minXp: number,
  options: WaitOptions = {},
): Promise<{ xp: number }> {
  const ctx = await createContext(API_BASE, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/engagement/xp?learnerId=${learnerId}`);
    if (!res.ok()) return null;

    const data = await res.json();
    const currentXp = data.xp ?? data.totalXp ?? 0;
    if (currentXp >= minXp) {
      return { xp: currentXp };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForMasteryUpdate(
  parentToken: string,
  brainId: string,
  domain: string,
  minScore: number,
  options: WaitOptions = {},
): Promise<{ domain: string; masteryScore: number }> {
  const ctx = await createContext(BRAIN_API, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/brain/profiles/${brainId}/context`);
    if (!res.ok()) return null;

    const data = await res.json();
    const domains = data.domains || [];
    const domainData = domains.find((d: { name: string }) => d.name === domain);

    if (domainData && domainData.masteryScore >= minScore) {
      return { domain, masteryScore: domainData.masteryScore };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForHomeworkProcessed(
  parentToken: string,
  homeworkId: string,
  options: WaitOptions = {},
): Promise<{ homeworkId: string; status: string }> {
  const ctx = await createContext(API_BASE, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/learning/homework/${homeworkId}`);
    if (!res.ok()) return null;

    const data = await res.json();
    if (data.status === 'processed' || data.status === 'ready') {
      return { homeworkId, status: data.status };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}

export async function waitForAssessmentCompleted(
  parentToken: string,
  learnerId: string,
  options: WaitOptions = {},
): Promise<{ assessmentId: string; status: string }> {
  const ctx = await createContext(API_BASE, parentToken);

  const result = await pollUntil(async () => {
    const res = await ctx.get(`/family/learners/${learnerId}`);
    if (!res.ok()) return null;

    const data = await res.json();
    const learner = data.learner || data;
    if (learner.assessmentStatus === 'completed' || learner.baselineComplete === true) {
      return { assessmentId: learner.assessmentId || '', status: 'completed' };
    }
    return null;
  }, options);

  await ctx.dispose();
  return result;
}
