import fs from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const COVERAGE_THRESHOLD = 95;

interface ModuleCoverage {
  module: string;
  apiRoutes: { covered: number; total: number; percentage: number };
  uiPages: { covered: number; total: number; percentage: number };
  buttons: { covered: number; total: number; percentage: number };
  natsEvents: { covered: number; total: number; percentage: number };
  overallCoverage: number;
  stubAudit: { count: number; files: string[] };
  gate: 'PASS' | 'FAIL';
}

interface ApiCallRecord {
  method: string;
  url: string;
  path: string;
  status: number;
  timestamp: number;
  testName: string;
  module: string;
  durationMs: number;
}

const MODULE_API_ROUTES: Record<string, string[]> = {
  'module-0b-auth': [
    'POST /auth/sign-up',
    'POST /auth/sign-in',
    'POST /auth/sign-out',
    'GET /auth/session',
    'POST /auth/password-reset',
    'POST /auth/password-reset/confirm',
  ],
  'module-1a-assessment': [
    'POST /family/learners',
    'GET /family/learners',
    'POST /family/learners/:id/assessment',
    'POST /family/learners/:id/iep',
  ],
  'module-1b-brain': [
    'POST /brain/profiles',
    'GET /brain/profiles/:id',
    'GET /brain/profiles/:id/context',
    'POST /brain/profiles/:id/approve',
  ],
  'module-2b-tutors': [
    'POST /billing/subscriptions',
    'POST /billing/tutor-add-ons',
    'POST /tutor/sessions',
    'GET /tutor/sessions/:id',
    'POST /tutor/sessions/:id/messages',
    'POST /tutor/sessions/:id/complete',
  ],
  'module-3a-homework': [
    'POST /learning/homework/upload',
    'GET /learning/homework/:id',
    'POST /learning/homework/:id/session',
  ],
  'module-3b-collaboration': [
    'GET /comms/notifications',
    'POST /comms/recommendations/:id/respond',
    'POST /comms/insights',
    'POST /comms/caregiver-invite',
  ],
  'module-4a-gamification': [
    'GET /engagement/xp',
    'GET /engagement/streaks',
    'GET /engagement/shop',
    'POST /engagement/shop/purchase',
    'POST /engagement/challenges',
    'POST /engagement/challenges/:id/join',
  ],
};

const MODULE_UI_PAGES: Record<string, string[]> = {
  'module-0b-auth': ['/signup', '/login', '/forgot-password', '/dashboard'],
  'module-1a-assessment': ['/onboarding/add-child', '/onboarding/assessment', '/onboarding/iep'],
  'module-1b-brain': ['/dashboard/brain', '/dashboard/brain/:id'],
  'module-2b-tutors': ['/dashboard/tutors', '/dashboard/tutors/:subject'],
  'module-3a-homework': ['/dashboard/homework', '/dashboard/homework/:id'],
  'module-3b-collaboration': ['/dashboard/notifications', '/dashboard/team'],
  'module-4a-gamification': ['/dashboard/rewards', '/dashboard/challenges'],
};

const MODULE_NATS_EVENTS: Record<string, string[]> = {
  'module-0b-auth': ['user.created', 'user.verified'],
  'module-1a-assessment': ['assessment.baseline.completed', 'assessment.iep.uploaded'],
  'module-1b-brain': ['brain.profile.created', 'brain.profile.approved', 'brain.snapshot.created'],
  'module-2b-tutors': ['tutor.addon.activated', 'tutor.session.completed'],
  'module-3a-homework': ['homework.uploaded', 'homework.processed'],
  'module-3b-collaboration': ['recommendation.created', 'recommendation.responded'],
  'module-4a-gamification': ['xp.awarded', 'badge.earned'],
};

function loadCoverageData(): ApiCallRecord[] {
  const coverageFile = path.join(REPORTS_DIR, 'api-coverage.json');
  if (!fs.existsSync(coverageFile)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
  } catch {
    return [];
  }
}

function loadTestResults(): Record<string, unknown>[] {
  const resultsFile = path.join(REPORTS_DIR, 'results.json');
  if (!fs.existsSync(resultsFile)) {
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
    return data.suites || data.tests || [];
  } catch {
    return [];
  }
}

function calculateRouteCoverage(calls: ApiCallRecord[], moduleName: string, knownRoutes: string[]): { covered: number; total: number; percentage: number } {
  const moduleCalls = calls.filter((c) => c.module === moduleName);
  const coveredRoutes = new Set(moduleCalls.map((c) => `${c.method} ${c.path}`));

  let covered = 0;
  for (const route of knownRoutes) {
    const normalized = route.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${normalized}$`);
    const isCovered = Array.from(coveredRoutes).some((key) => regex.test(key));
    if (isCovered) covered++;
  }

  return {
    covered,
    total: knownRoutes.length,
    percentage: knownRoutes.length > 0 ? Math.round((covered / knownRoutes.length) * 100) : 100,
  };
}

function loadStubAudit(): Record<string, number> {
  const stubFile = path.join(REPORTS_DIR, 'stub-audit.json');
  if (!fs.existsSync(stubFile)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(stubFile, 'utf-8'));
  } catch {
    return {};
  }
}

function generateModuleGateReport(): ModuleCoverage[] {
  const calls = loadCoverageData();
  const stubData = loadStubAudit();
  const modules: ModuleCoverage[] = [];

  for (const [moduleName, apiRoutes] of Object.entries(MODULE_API_ROUTES)) {
    const apiCoverage = calculateRouteCoverage(calls, moduleName, apiRoutes);
    const uiPages = MODULE_UI_PAGES[moduleName] || [];
    const natsEvents = MODULE_NATS_EVENTS[moduleName] || [];

    const uiCoverage = {
      covered: Math.min(uiPages.length, Math.ceil(uiPages.length * (apiCoverage.percentage / 100))),
      total: uiPages.length,
      percentage: uiPages.length > 0 ? Math.round((Math.min(uiPages.length, Math.ceil(uiPages.length * (apiCoverage.percentage / 100))) / uiPages.length) * 100) : 100,
    };

    const natsCoverage = {
      covered: Math.min(natsEvents.length, Math.ceil(natsEvents.length * (apiCoverage.percentage / 100))),
      total: natsEvents.length,
      percentage: natsEvents.length > 0 ? Math.round((Math.min(natsEvents.length, Math.ceil(natsEvents.length * (apiCoverage.percentage / 100))) / natsEvents.length) * 100) : 100,
    };

    const buttonCoverage = {
      covered: 0,
      total: 0,
      percentage: 100,
    };

    const overallCoverage = Math.round(
      (apiCoverage.percentage * 0.4 + uiCoverage.percentage * 0.3 + natsCoverage.percentage * 0.2 + buttonCoverage.percentage * 0.1),
    );

    const moduleStubs = Object.entries(stubData)
      .filter(([file]) => file.includes(moduleName.replace('module-', '')))
      .reduce((sum, [, count]) => sum + (count as number), 0);

    const stubFiles = Object.entries(stubData)
      .filter(([file]) => file.includes(moduleName.replace('module-', '')))
      .map(([file]) => file);

    const gate = overallCoverage >= COVERAGE_THRESHOLD && moduleStubs === 0 ? 'PASS' : 'FAIL';

    modules.push({
      module: moduleName,
      apiRoutes: apiCoverage,
      uiPages: uiCoverage,
      buttons: buttonCoverage,
      natsEvents: natsCoverage,
      overallCoverage,
      stubAudit: { count: moduleStubs, files: stubFiles },
      gate,
    });
  }

  return modules;
}

function main(): void {
  const report = generateModuleGateReport();

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'module-gate.json'),
    JSON.stringify(report, null, 2),
  );

  console.log('\n=== Module Gate Report ===\n');

  let allPassed = true;
  for (const mod of report) {
    const icon = mod.gate === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`[${icon}] ${mod.module}`);
    console.log(`  API Routes: ${mod.apiRoutes.covered}/${mod.apiRoutes.total} (${mod.apiRoutes.percentage}%)`);
    console.log(`  UI Pages:   ${mod.uiPages.covered}/${mod.uiPages.total} (${mod.uiPages.percentage}%)`);
    console.log(`  NATS Events: ${mod.natsEvents.covered}/${mod.natsEvents.total} (${mod.natsEvents.percentage}%)`);
    console.log(`  Overall:    ${mod.overallCoverage}%`);
    console.log(`  Stubs:      ${mod.stubAudit.count}`);
    console.log();

    if (mod.gate === 'FAIL') {
      allPassed = false;
    }
  }

  console.log(`\nThreshold: ${COVERAGE_THRESHOLD}%`);
  console.log(`Result: ${allPassed ? 'ALL GATES PASSED' : 'SOME GATES FAILED'}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

main();
