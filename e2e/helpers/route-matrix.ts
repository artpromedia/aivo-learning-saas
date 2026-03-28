import fs from 'node:fs';
import path from 'node:path';
import type { ApiCallRecord } from './coverage-tracker';

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

export interface RouteEntry {
  method: string;
  path: string;
  modules: string[];
  tests: string[];
  callCount: number;
  avgDurationMs: number;
  statusCodes: number[];
}

export interface CoverageMatrix {
  generatedAt: string;
  totalRoutes: number;
  totalCalls: number;
  routes: RouteEntry[];
  moduleBreakdown: Record<string, { routesCovered: number; totalCalls: number }>;
}

/**
 * Known API routes in the platform. Used to calculate coverage percentage.
 */
const KNOWN_ROUTES: string[] = [
  'POST /auth/sign-up',
  'POST /auth/sign-in',
  'POST /auth/sign-out',
  'GET /auth/session',
  'POST /auth/password-reset',
  'POST /auth/password-reset/confirm',
  'POST /auth/verify-email',
  'GET /family/learners',
  'POST /family/learners',
  'GET /family/learners/:id',
  'PUT /family/learners/:id',
  'POST /family/learners/:id/assessment',
  'POST /family/learners/:id/iep',
  'GET /brain/profiles',
  'POST /brain/profiles',
  'GET /brain/profiles/:id',
  'POST /brain/profiles/:id/approve',
  'GET /brain/profiles/:id/context',
  'GET /billing/subscriptions',
  'POST /billing/subscriptions',
  'POST /billing/tutor-add-ons',
  'DELETE /billing/tutor-add-ons/:id',
  'POST /tutor/sessions',
  'GET /tutor/sessions/:id',
  'POST /tutor/sessions/:id/messages',
  'POST /tutor/sessions/:id/complete',
  'POST /learning/homework/upload',
  'GET /learning/homework/:id',
  'POST /learning/homework/:id/session',
  'GET /engagement/xp',
  'GET /engagement/streaks',
  'GET /engagement/shop',
  'POST /engagement/shop/purchase',
  'POST /engagement/challenges',
  'POST /engagement/challenges/:id/join',
  'GET /comms/notifications',
  'POST /comms/recommendations/:id/respond',
  'POST /comms/insights',
  'POST /comms/caregiver-invite',
];

export function generateCoverageMatrix(): CoverageMatrix {
  const coverageFile = path.join(REPORTS_DIR, 'api-coverage.json');

  if (!fs.existsSync(coverageFile)) {
    return {
      generatedAt: new Date().toISOString(),
      totalRoutes: 0,
      totalCalls: 0,
      routes: [],
      moduleBreakdown: {},
    };
  }

  const calls: ApiCallRecord[] = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));

  // Group calls by route
  const routeMap = new Map<string, {
    calls: ApiCallRecord[];
    modules: Set<string>;
    tests: Set<string>;
    statuses: Set<number>;
  }>();

  for (const call of calls) {
    const key = `${call.method} ${call.path}`;
    if (!routeMap.has(key)) {
      routeMap.set(key, { calls: [], modules: new Set(), tests: new Set(), statuses: new Set() });
    }
    const entry = routeMap.get(key)!;
    entry.calls.push(call);
    entry.modules.add(call.module);
    entry.tests.add(call.testName);
    entry.statuses.add(call.status);
  }

  const routes: RouteEntry[] = Array.from(routeMap.entries()).map(([key, data]) => {
    const [method, routePath] = key.split(' ', 2);
    const totalDuration = data.calls.reduce((sum, c) => sum + c.durationMs, 0);
    return {
      method,
      path: routePath,
      modules: Array.from(data.modules),
      tests: Array.from(data.tests),
      callCount: data.calls.length,
      avgDurationMs: Math.round(totalDuration / data.calls.length),
      statusCodes: Array.from(data.statuses).sort(),
    };
  });

  // Module breakdown
  const moduleBreakdown: Record<string, { routesCovered: number; totalCalls: number }> = {};
  for (const call of calls) {
    if (!moduleBreakdown[call.module]) {
      moduleBreakdown[call.module] = { routesCovered: 0, totalCalls: 0 };
    }
    moduleBreakdown[call.module].totalCalls++;
  }
  for (const [module, data] of Object.entries(moduleBreakdown)) {
    const moduleRoutes = new Set(
      calls.filter((c) => c.module === module).map((c) => `${c.method} ${c.path}`),
    );
    data.routesCovered = moduleRoutes.size;
  }

  const matrix: CoverageMatrix = {
    generatedAt: new Date().toISOString(),
    totalRoutes: routes.length,
    totalCalls: calls.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    moduleBreakdown,
  };

  // Write matrix output
  const matrixFile = path.join(REPORTS_DIR, 'route-matrix.json');
  fs.writeFileSync(matrixFile, JSON.stringify(matrix, null, 2));

  return matrix;
}

export function getKnownRoutes(): string[] {
  return [...KNOWN_ROUTES];
}

export function getCoveragePercentage(): { covered: number; total: number; percentage: number } {
  const matrix = generateCoverageMatrix();
  const coveredRouteKeys = new Set(matrix.routes.map((r) => `${r.method} ${r.path}`));

  // Normalize known routes for comparison (strip :id params)
  let covered = 0;
  for (const known of KNOWN_ROUTES) {
    const normalized = known.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${normalized}$`);
    const isCovered = Array.from(coveredRouteKeys).some((key) => regex.test(key));
    if (isCovered) covered++;
  }

  return {
    covered,
    total: KNOWN_ROUTES.length,
    percentage: Math.round((covered / KNOWN_ROUTES.length) * 100),
  };
}
