/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'clear-text', 'progress', 'json'],

  testRunner: 'vitest',

  mutate: [
    'services/identity-svc/src/routes/auth/**/*.ts',
    'services/identity-svc/src/middleware/**/*.ts',
    'services/billing-svc/src/routes/**/*.ts',
    'services/billing-svc/src/services/**/*.ts',
    'services/learning-svc/src/routes/**/*.ts',
    'services/engagement-svc/src/routes/**/*.ts',
    'services/family-svc/src/routes/**/*.ts',
    'packages/db/src/rls/**/*.ts',
    'packages/security/src/**/*.ts',

    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!**/__tests__/**',
    '!**/test/**',
    '!**/node_modules/**',
  ],

  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },

  timeoutMS: 60000,
  timeoutFactor: 2.5,

  concurrency: 4,

  ignorePatterns: [
    'node_modules',
    'dist',
    '.next',
    'coverage',
    'apps/mobile',
    'apps/marketing',
    'infra',
    'e2e',
    'docs',
  ],

  htmlReporter: {
    fileName: 'reports/mutation/mutation-report.html',
  },

  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },

  incremental: true,
  incrementalFile: '.stryker-tmp/incremental.json',
};
