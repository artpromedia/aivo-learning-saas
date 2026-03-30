import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 4,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { outputFolder: 'reports/html', open: isCI ? 'never' : 'on-failure' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['json', { outputFile: 'reports/coverage-results.json' }],
    ...(isCI ? [['github' as const]] : []),
  ],

  globalSetup: path.resolve(__dirname, 'global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'global-teardown.ts'),

  webServer: {
    command: 'pnpm --filter web dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_URL: process.env.API_BASE_URL || 'http://localhost:3101',
    },
  },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    extraHTTPHeaders: {
      'x-test-run': 'true',
    },
  },

  projects: [
    {
      name: 'module-0b-auth',
      testMatch: /module-0b/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-1a-assessment',
      testMatch: /module-1a/,
      dependencies: ['module-0b-auth'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-1b-brain',
      testMatch: /module-1b/,
      dependencies: ['module-1a-assessment'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-2a-content-gen',
      testMatch: /module-2a/,
      dependencies: ['module-1b-brain'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-2b-tutors',
      testMatch: /module-2b/,
      dependencies: ['module-1b-brain'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-3a-homework',
      testMatch: /module-3a/,
      dependencies: ['module-2b-tutors'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-3b-collaboration',
      testMatch: /module-3b/,
      dependencies: ['module-0b-auth'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-4a-gamification',
      testMatch: /module-4a/,
      dependencies: ['module-2b-tutors'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-4b-avatar-shop',
      testMatch: /module-4b/,
      dependencies: ['module-4a-gamification'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-5a-enterprise',
      testMatch: /module-5a/,
      dependencies: ['module-0b-auth'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'integration',
      testMatch: /integration/,
      dependencies: ['module-0b-auth', 'module-1a-assessment', 'module-1b-brain', 'module-2b-tutors', 'module-3b-collaboration'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
