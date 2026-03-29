import { FullConfig } from '@playwright/test';
import { execSync } from 'node:child_process';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2_000;

async function waitForService(url: string, label: string): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`  [ok] ${label} is healthy`);
        return;
      }
    } catch {
      // service not ready yet
    }
    if (attempt % 5 === 0) {
      console.log(`  [wait] ${label} not ready (attempt ${attempt}/${MAX_RETRIES})`);
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  throw new Error(`${label} did not become healthy after ${MAX_RETRIES} attempts`);
}

async function runMigrations(): Promise<void> {
  console.log('[setup] Running database migrations...');
  try {
    execSync('pnpm --filter identity-svc exec drizzle-kit push', {
      cwd: process.env.PROJECT_ROOT || new URL('..', import.meta.url).pathname,
      stdio: 'pipe',
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://aivo:aivo_test@localhost:5433/aivo_test',
      },
    });
    console.log('  [ok] Migrations complete');
  } catch {
    console.warn('  [warn] Migration command failed, services may handle their own migrations');
  }
}

async function seedTestFixtures(): Promise<void> {
  console.log('[setup] Seeding test fixtures...');

  const seedData = {
    testRunId: `e2e-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE}/test/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedData),
    });

    if (response.ok) {
      console.log('  [ok] Test fixtures seeded via API');
    } else {
      console.warn('  [warn] Seed endpoint returned non-OK, tests will create data as needed');
    }
  } catch {
    console.warn('  [warn] Seed endpoint not available, tests will create data as needed');
  }
}

async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('\n=== AIVO E2E Global Setup ===\n');

  // Wait for infrastructure services
  console.log('[setup] Waiting for services to be healthy...');
  await waitForService('http://localhost:5433', 'PostgreSQL (test)').catch(() => {
    console.log('  [info] PostgreSQL health check via HTTP not available, assuming ready via Docker healthcheck');
  });

  await waitForService(`${API_BASE}/health`, 'identity-svc');
  await waitForService('http://localhost:3102/health', 'brain-svc');

  // Run migrations
  await runMigrations();

  // Seed fixtures
  await seedTestFixtures();

  // Store test run metadata for teardown
  process.env.E2E_TEST_RUN_ID = `e2e-${Date.now()}`;

  console.log('\n=== Setup Complete ===\n');
}

export default globalSetup;
