import { APIRequestContext, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

export type UserRole = 'parent' | 'teacher' | 'district_admin';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  token: string;
}

let requestContext: APIRequestContext | null = null;

async function getRequestContext(): Promise<APIRequestContext> {
  if (!requestContext) {
    requestContext = await request.newContext({
      baseURL: API_BASE,
      extraHTTPHeaders: { 'x-test-run': 'true' },
    });
  }
  return requestContext;
}

function generateEmail(role: string): string {
  const id = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `e2e+${id}@aivo.test`;
}

async function retryOn429<T>(fn: () => Promise<T>, label: string, maxRetries = 5): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('429') && attempt < maxRetries - 1) {
        const delay = Math.min(2000 * 2 ** attempt, 30000);
        console.warn(`[retry] ${label} rate-limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`${label} failed after ${maxRetries} retries`);
}

async function createUser(role: UserRole, namePrefix: string): Promise<TestUser> {
  const ctx = await getRequestContext();
  const email = generateEmail(role);
  const password = 'E2eTest!Secure456';
  const name = `${namePrefix} ${Date.now().toString(36)}`;

  const signUpRes = await retryOn429(async () => {
    const res = await ctx.post('/auth/sign-up', {
      data: { email, password, name, role },
    });
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Failed to create ${role}: ${res.status()} ${body}`);
    }
    return res;
  }, `sign-up ${role}`);

  const signUpData = await signUpRes.json();

  // Auto-verify email in test mode
  await retryOn429(async () => {
    const res = await ctx.post('/test/verify-email', {
      data: { email },
    });
    return res;
  }, `verify-email ${role}`);

  // Sign in to get a valid token
  const signInRes = await retryOn429(async () => {
    const res = await ctx.post('/auth/sign-in', {
      data: { email, password },
    });
    if (!res.ok()) {
      throw new Error(`Failed to sign in as ${role}: ${res.status()}`);
    }
    return res;
  }, `sign-in ${role}`);

  const signInData = await signInRes.json();

  return {
    id: signUpData.user?.id || signInData.user?.id,
    email,
    password,
    name,
    role,
    token: signInData.token || signInData.session?.token,
  };
}

export async function createTestParent(): Promise<TestUser> {
  return createUser('parent', 'Test Parent');
}

export async function createTestTeacher(): Promise<TestUser> {
  return createUser('teacher', 'Test Teacher');
}

export async function createTestDistrictAdmin(): Promise<TestUser> {
  return createUser('district_admin', 'Test District Admin');
}

export async function authenticateAs(role: UserRole): Promise<{
  user: TestUser;
  authHeaders: Record<string, string>;
  cookies: string;
}> {
  let user: TestUser;

  switch (role) {
    case 'parent':
      user = await createTestParent();
      break;
    case 'teacher':
      user = await createTestTeacher();
      break;
    case 'district_admin':
      user = await createTestDistrictAdmin();
      break;
    default:
      throw new Error(`Unknown role: ${role}`);
  }

  const authHeaders = {
    Authorization: `Bearer ${user.token}`,
    'Content-Type': 'application/json',
  };

  // Retrieve session cookies
  const ctx = await getRequestContext();
  const sessionRes = await ctx.get('/auth/session', {
    headers: authHeaders,
  });
  const setCookieHeader = sessionRes.headers()['set-cookie'] || '';

  return {
    user,
    authHeaders,
    cookies: setCookieHeader,
  };
}

export async function disposeAuthContext(): Promise<void> {
  if (requestContext) {
    await requestContext.dispose();
    requestContext = null;
  }
}
