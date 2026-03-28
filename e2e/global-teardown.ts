import { FullConfig } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

async function cleanupTestData(): Promise<void> {
  const testRunId = process.env.E2E_TEST_RUN_ID;

  console.log('[teardown] Cleaning up test data...');

  try {
    const response = await fetch(`${API_BASE}/test/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testRunId }),
    });

    if (response.ok) {
      console.log('  [ok] Test data cleaned up via API');
    } else {
      console.warn('  [warn] Cleanup endpoint returned non-OK status');
    }
  } catch {
    console.warn('  [warn] Cleanup endpoint not available, data will persist until next run');
  }
}

async function flushRedis(): Promise<void> {
  console.log('[teardown] Flushing test Redis...');
  try {
    const response = await fetch(`${API_BASE}/test/flush-cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      console.log('  [ok] Redis flushed');
    }
  } catch {
    console.warn('  [warn] Redis flush not available');
  }
}

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n=== AIVO E2E Global Teardown ===\n');

  await cleanupTestData();
  await flushRedis();

  console.log('\n=== Teardown Complete ===\n');
}

export default globalTeardown;
