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
    ...(isCI ? [['github' as const]] : []),
  ],

  globalSetup: path.resolve(__dirname, 'global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'global-teardown.ts'),

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
      testMatch: /module-0b-auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-1a-assessment',
      testMatch: /module-1a-assessment\.spec\.ts/,
      dependencies: ['module-0b-auth'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-1b-brain',
      testMatch: /module-1b-brain\.spec\.ts/,
      dependencies: ['module-1a-assessment'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-2b-tutors',
      testMatch: /module-2b-tutors\.spec\.ts/,
      dependencies: ['module-1b-brain'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-3a-homework',
      testMatch: /module-3a-homework\.spec\.ts/,
      dependencies: ['module-2b-tutors'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-3b-collaboration',
      testMatch: /module-3b-collaboration\.spec\.ts/,
      dependencies: ['module-0b-auth'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'module-4a-gamification',
      testMatch: /module-4a-gamification\.spec\.ts/,
      dependencies: ['module-2b-tutors'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
