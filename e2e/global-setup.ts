import { FullConfig } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2_000;

async function waitForService(
  url: string,
  label: string,
  { required = true }: { required?: boolean } = {},
): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`  [ok] ${label} is healthy`);
        return true;
      }
    } catch {
      // service not ready yet
    }
    if (attempt % 5 === 0) {
      console.log(`  [wait] ${label} not ready (attempt ${attempt}/${MAX_RETRIES})`);
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  if (!required) {
    console.warn(`  [skip] ${label} not available — tests that depend on it will be skipped`);
    return false;
  }
  throw new Error(`${label} did not become healthy after ${MAX_RETRIES} attempts`);
}

async function runMigrations(): Promise<void> {
  console.log('[setup] Running database migrations...');
  try {
    execSync('pnpm --filter @aivo/db db:push', {
      cwd: process.env.PROJECT_ROOT || path.resolve(__dirname, '..'),
      stdio: ['pipe', 'inherit', 'inherit'],
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://aivo:aivo_test@localhost:5433/aivo_test',
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

const I18N_BASE = process.env.NEXT_PUBLIC_I18N_SVC_URL || 'http://localhost:3011';

async function seedI18nTranslations(): Promise<void> {
  console.log('[setup] Seeding i18n translations...');
  try {
    const response = await fetch(`${I18N_BASE}/i18n/seed`, { method: 'POST' });
    if (response.ok) {
      console.log('  [ok] i18n translations seeded');
    } else {
      console.warn(`  [warn] i18n seed returned ${response.status}, UI may show raw keys`);
    }
  } catch {
    console.warn('  [warn] i18n-svc not available, UI will show raw translation keys');
  }
}

async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('\n=== AIVO E2E Global Setup ===\n');

  // Wait for infrastructure services
  console.log('[setup] Waiting for services to be healthy...');
  // PostgreSQL does not speak HTTP — rely on Docker/CI health check instead.
  // Verify connectivity by attempting a lightweight TCP connection.
  await new Promise<void>((resolve) => {
    import('node:net').then(({ createConnection }) => {
      let attempts = 0;
      const tryConnect = () => {
        attempts++;
        const sock = createConnection({ host: '127.0.0.1', port: 5433 }, () => {
          sock.destroy();
          console.log('  [ok] PostgreSQL (test) is reachable');
          resolve();
        });
        sock.on('error', () => {
          sock.destroy();
          if (attempts >= 15) {
            console.warn('  [skip] PostgreSQL (test) not available — tests that depend on it will be skipped');
            resolve();
          } else {
            if (attempts % 5 === 0) {
              console.log(`  [wait] PostgreSQL (test) not ready (attempt ${attempts}/15)`);
            }
            setTimeout(tryConnect, 2_000);
          }
        });
        sock.setTimeout(2_000, () => {
          sock.destroy();
        });
      };
      tryConnect();
    });
  });

  await waitForService(`${API_BASE}/health`, 'identity-svc');
  const brainAvailable = await waitForService('http://localhost:3102/health', 'brain-svc', { required: false });

  // Export brain-svc availability so tests can skip if needed
  process.env.BRAIN_SVC_AVAILABLE = brainAvailable ? '1' : '0';

  // Run migrations
  await runMigrations();

  // Seed fixtures
  await seedTestFixtures();

  // Seed i18n translations (must run after migrations)
  await seedI18nTranslations();

  // Store test run metadata for teardown
  process.env.E2E_TEST_RUN_ID = `e2e-${Date.now()}`;

  console.log('\n=== Setup Complete ===\n');
}

export default globalSetup;
