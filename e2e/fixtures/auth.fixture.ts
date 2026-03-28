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

async function createUser(role: UserRole, namePrefix: string): Promise<TestUser> {
  const ctx = await getRequestContext();
  const email = generateEmail(role);
  const password = 'E2eTest!Secure456';
  const name = `${namePrefix} ${Date.now().toString(36)}`;

  const signUpRes = await ctx.post('/auth/sign-up', {
    data: { email, password, name, role },
  });

  if (!signUpRes.ok()) {
    const body = await signUpRes.text();
    throw new Error(`Failed to create ${role}: ${signUpRes.status()} ${body}`);
  }

  const signUpData = await signUpRes.json();

  // Auto-verify email in test mode
  await ctx.post('/test/verify-email', {
    data: { email },
  });

  // Sign in to get a valid token
  const signInRes = await ctx.post('/auth/sign-in', {
    data: { email, password },
  });

  if (!signInRes.ok()) {
    throw new Error(`Failed to sign in as ${role}: ${signInRes.status()}`);
  }

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
