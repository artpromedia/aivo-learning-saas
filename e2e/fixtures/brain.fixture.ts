import { request } from '@playwright/test';

const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

let _brainAvailable: boolean | null = null;

export async function isBrainAvailable(): Promise<boolean> {
  if (_brainAvailable !== null) return _brainAvailable;
  try {
    const ctx = await request.newContext({ baseURL: BRAIN_API });
    const res = await ctx.get('/health');
    _brainAvailable = res.ok();
    await ctx.dispose();
  } catch {
    _brainAvailable = false;
  }
  return _brainAvailable;
}

export interface BrainState {
  brainId: string;
  learnerId: string;
  status: 'pending' | 'profiling' | 'ready' | 'active';
  domains: BrainDomain[];
}

export interface BrainDomain {
  name: string;
  currentLevel: number;
  masteryScore: number;
}

export async function createBrainProfile(
  parentToken: string,
  learnerId: string,
): Promise<BrainState> {
  const ctx = await request.newContext({
    baseURL: BRAIN_API,
    extraHTTPHeaders: {
      Authorization: `Bearer ${parentToken}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });

  // Trigger brain profile creation
  const createRes = await ctx.post('/brain/profiles', {
    data: { learnerId },
  });

  if (!createRes.ok()) {
    const body = await createRes.text();
    throw new Error(`Failed to create brain profile: ${createRes.status()} ${body}`);
  }

  const data = await createRes.json();
  await ctx.dispose();

  return {
    brainId: data.brainId || data.id,
    learnerId,
    status: data.status || 'pending',
    domains: data.domains || [],
  };
}

export async function waitForBrainReady(
  parentToken: string,
  brainId: string,
  maxWaitMs: number = 30_000,
): Promise<BrainState> {
  const ctx = await request.newContext({
    baseURL: BRAIN_API,
    extraHTTPHeaders: {
      Authorization: `Bearer ${parentToken}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });

  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const res = await ctx.get(`/brain/profiles/${brainId}`);
    if (res.ok()) {
      const data = await res.json();
      if (data.status === 'ready' || data.status === 'active') {
        await ctx.dispose();
        return {
          brainId,
          learnerId: data.learnerId,
          status: data.status,
          domains: data.domains || [],
        };
      }
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }

  await ctx.dispose();
  throw new Error(`Brain ${brainId} did not reach ready state within ${maxWaitMs}ms`);
}

export async function approveBrain(
  parentToken: string,
  brainId: string,
): Promise<BrainState> {
  const ctx = await request.newContext({
    baseURL: BRAIN_API,
    extraHTTPHeaders: {
      Authorization: `Bearer ${parentToken}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });

  const res = await ctx.post(`/brain/profiles/${brainId}/approve`);

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to approve brain: ${res.status()} ${body}`);
  }

  const data = await res.json();
  await ctx.dispose();

  return {
    brainId,
    learnerId: data.learnerId,
    status: data.status || 'active',
    domains: data.domains || [],
  };
}

export async function getPreClonedBrainState(
  parentToken: string,
  learnerId: string,
): Promise<BrainState> {
  const brain = await createBrainProfile(parentToken, learnerId);
  const ready = await waitForBrainReady(parentToken, brain.brainId);
  return approveBrain(parentToken, ready.brainId);
}
