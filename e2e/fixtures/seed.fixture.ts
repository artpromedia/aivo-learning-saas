import { APIRequestContext, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const BRAIN_API = process.env.BRAIN_API_URL || 'http://localhost:3102';

export interface SeededTenant {
  id: string;
  name: string;
  slug: string;
}

export interface SeededParent {
  id: string;
  email: string;
  password: string;
  token: string;
  tenantId: string;
}

export interface SeededLearner {
  id: string;
  name: string;
  parentId: string;
  brainId: string;
  functioningLevel: string;
  assessmentId: string;
}

export interface SeededTeacher {
  id: string;
  email: string;
  password: string;
  token: string;
  tenantId: string;
}

export interface SeededCaregiver {
  id: string;
  email: string;
  learnerId: string;
  role: 'caregiver';
}

export interface SeedLearnerOptions {
  name?: string;
  functioningLevel?: number;
  gradeLevel?: string;
  withIep?: boolean;
  iepContent?: string;
}

async function createContext(baseURL: string, token?: string): Promise<APIRequestContext> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-test-run': 'true',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return request.newContext({ baseURL, extraHTTPHeaders: headers });
}

export async function createSeededTenant(): Promise<SeededTenant> {
  const ctx = await createContext(API_BASE);
  const slug = `test-tenant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const res = await ctx.post('/admin/tenants', {
    data: {
      name: `Test Tenant ${slug}`,
      slug,
      testMode: true,
    },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to create tenant: ${res.status()} ${body}`);
  }

  const data = await res.json();
  await ctx.dispose();

  return {
    id: data.tenantId || data.id,
    name: data.name || `Test Tenant ${slug}`,
    slug,
  };
}

export async function createSeededParent(tenantId: string): Promise<SeededParent> {
  const ctx = await createContext(API_BASE);
  const email = `e2e+parent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@aivo.test`;
  const password = 'E2eTest!Secure456';

  const signUpRes = await ctx.post('/auth/sign-up', {
    data: {
      email,
      password,
      name: `Seed Parent ${Date.now().toString(36)}`,
      role: 'parent',
      tenantId,
    },
  });

  if (!signUpRes.ok()) {
    const body = await signUpRes.text();
    throw new Error(`Failed to create seeded parent: ${signUpRes.status()} ${body}`);
  }

  const signUpData = await signUpRes.json();

  await ctx.post('/test/verify-email', { data: { email } });

  const signInRes = await ctx.post('/auth/sign-in', {
    data: { email, password },
  });

  if (!signInRes.ok()) {
    throw new Error(`Failed to sign in seeded parent: ${signInRes.status()}`);
  }

  const signInData = await signInRes.json();
  await ctx.dispose();

  return {
    id: signUpData.user?.id || signInData.user?.id,
    email,
    password,
    token: signInData.token || signInData.session?.token,
    tenantId,
  };
}

export async function createSeededLearner(
  parentToken: string,
  options: SeedLearnerOptions = {},
): Promise<SeededLearner> {
  const functioningLevel = options.functioningLevel ?? 3;
  const gradeLevel = options.gradeLevel ?? '3rd';
  const learnerName = options.name ?? `Seed Learner ${Date.now().toString(36)}`;

  const ctx = await createContext(API_BASE, parentToken);

  const learnerRes = await ctx.post('/family/learners', {
    data: {
      name: learnerName,
      dateOfBirth: '2016-06-15',
      gradeLevel,
      functioningLevel,
      specialNeeds: functioningLevel <= 2 ? ['speech', 'motor'] : [],
    },
  });

  if (!learnerRes.ok()) {
    const body = await learnerRes.text();
    throw new Error(`Failed to create seeded learner: ${learnerRes.status()} ${body}`);
  }

  const learnerData = await learnerRes.json();
  const learnerId = learnerData.learner?.id || learnerData.id;

  const assessmentRes = await ctx.post(`/family/learners/${learnerId}/assessment`, {
    data: {
      responses: generateAssessmentResponses(functioningLevel),
      functioningLevel,
      testMode: true,
    },
  });

  if (!assessmentRes.ok()) {
    const body = await assessmentRes.text();
    throw new Error(`Failed to submit assessment: ${assessmentRes.status()} ${body}`);
  }

  const assessmentData = await assessmentRes.json();

  if (options.withIep) {
    await ctx.post(`/family/learners/${learnerId}/iep`, {
      data: {
        content: options.iepContent ?? 'Simulated IEP content for e2e testing',
        testMode: true,
      },
    });
  }

  const brainCtx = await createContext(BRAIN_API, parentToken);
  const brainRes = await brainCtx.post('/brain/profiles', {
    data: { learnerId },
  });

  let brainId = '';
  if (brainRes.ok()) {
    const brainData = await brainRes.json();
    brainId = brainData.brainId || brainData.id;

    const start = Date.now();
    while (Date.now() - start < 30_000) {
      const statusRes = await brainCtx.get(`/brain/profiles/${brainId}`);
      if (statusRes.ok()) {
        const statusData = await statusRes.json();
        if (statusData.status === 'ready' || statusData.status === 'active') {
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 1_000));
    }
  }

  await brainCtx.dispose();
  await ctx.dispose();

  return {
    id: learnerId,
    name: learnerName,
    parentId: learnerData.learner?.parentId || learnerData.parentId,
    brainId,
    functioningLevel: String(functioningLevel),
    assessmentId: assessmentData.assessmentId || assessmentData.id || '',
  };
}

export async function createSeededTeacher(tenantId: string): Promise<SeededTeacher> {
  const ctx = await createContext(API_BASE);
  const email = `e2e+teacher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@aivo.test`;
  const password = 'E2eTest!Secure456';

  const signUpRes = await ctx.post('/auth/sign-up', {
    data: {
      email,
      password,
      name: `Seed Teacher ${Date.now().toString(36)}`,
      role: 'teacher',
      tenantId,
    },
  });

  if (!signUpRes.ok()) {
    const body = await signUpRes.text();
    throw new Error(`Failed to create seeded teacher: ${signUpRes.status()} ${body}`);
  }

  const signUpData = await signUpRes.json();

  await ctx.post('/test/verify-email', { data: { email } });

  const signInRes = await ctx.post('/auth/sign-in', {
    data: { email, password },
  });

  if (!signInRes.ok()) {
    throw new Error(`Failed to sign in seeded teacher: ${signInRes.status()}`);
  }

  const signInData = await signInRes.json();
  await ctx.dispose();

  return {
    id: signUpData.user?.id || signInData.user?.id,
    email,
    password,
    token: signInData.token || signInData.session?.token,
    tenantId,
  };
}

export async function createSeededCaregiver(
  parentToken: string,
  learnerId: string,
): Promise<SeededCaregiver> {
  const ctx = await createContext(API_BASE, parentToken);
  const email = `e2e+caregiver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@aivo.test`;

  const res = await ctx.post('/comms/caregiver-invite', {
    data: {
      email,
      learnerId,
      name: `Seed Caregiver ${Date.now().toString(36)}`,
    },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to invite caregiver: ${res.status()} ${body}`);
  }

  const data = await res.json();
  await ctx.dispose();

  return {
    id: data.caregiverId || data.id,
    email,
    learnerId,
    role: 'caregiver',
  };
}

export async function seedTutorSubscription(
  parentToken: string,
  learnerId: string,
  sku: string = 'math',
): Promise<{ tutorId: string; subscriptionId: string }> {
  const ctx = await createContext(API_BASE, parentToken);

  const subRes = await ctx.post('/billing/subscriptions', {
    data: {
      planTier: 'growth',
      paymentMethod: 'test_pm_card_visa',
      testMode: true,
    },
  });

  if (!subRes.ok()) {
    const body = await subRes.text();
    throw new Error(`Failed to create subscription: ${subRes.status()} ${body}`);
  }

  const subData = await subRes.json();

  const tutorRes = await ctx.post('/billing/tutor-add-ons', {
    data: {
      learnerId,
      subject: sku,
      testMode: true,
    },
  });

  if (!tutorRes.ok()) {
    const body = await tutorRes.text();
    throw new Error(`Failed to subscribe tutor: ${tutorRes.status()} ${body}`);
  }

  const tutorData = await tutorRes.json();
  await ctx.dispose();

  return {
    tutorId: tutorData.tutorId || tutorData.id,
    subscriptionId: subData.subscriptionId || subData.id,
  };
}

export async function seedGamificationData(
  learnerId: string,
): Promise<{ xp: number; badges: string[]; quests: string[] }> {
  const ctx = await createContext(API_BASE);

  const res = await ctx.post('/test/seed-gamification', {
    data: {
      learnerId,
      xp: 500,
      badges: ['first-session', 'streak-3', 'math-explorer'],
      quests: ['daily-practice', 'weekly-challenge'],
      streakDays: 5,
    },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to seed gamification data: ${res.status()} ${body}`);
  }

  const data = await res.json();
  await ctx.dispose();

  return {
    xp: data.xp ?? 500,
    badges: data.badges ?? ['first-session', 'streak-3', 'math-explorer'],
    quests: data.quests ?? ['daily-practice', 'weekly-challenge'],
  };
}

function generateAssessmentResponses(functioningLevel: number): Record<string, unknown>[] {
  const responses: Record<string, unknown>[] = [
    { questionId: 'verbal-communication', answer: functioningLevel >= 3 ? 'full-sentences' : functioningLevel >= 2 ? 'short-phrases' : 'non-verbal' },
    { questionId: 'reading-level', answer: functioningLevel >= 4 ? 'grade-level' : functioningLevel >= 3 ? 'below-grade' : 'pre-reading' },
    { questionId: 'math-skills', answer: functioningLevel >= 4 ? 'grade-level' : functioningLevel >= 3 ? 'basic-operations' : 'counting' },
    { questionId: 'attention-span', answer: functioningLevel >= 3 ? 'age-appropriate' : 'limited' },
    { questionId: 'motor-skills', answer: functioningLevel >= 3 ? 'typical' : 'needs-support' },
    { questionId: 'social-interaction', answer: functioningLevel >= 3 ? 'peers' : functioningLevel >= 2 ? 'adults-only' : 'minimal' },
    { questionId: 'self-regulation', answer: functioningLevel >= 4 ? 'independent' : functioningLevel >= 2 ? 'some-support' : 'significant-support' },
    { questionId: 'daily-living', answer: functioningLevel >= 3 ? 'mostly-independent' : 'needs-assistance' },
  ];
  return responses;
}
