import fs from 'node:fs';
import path from 'node:path';
import { generateCoverageMatrix, getCoveragePercentage, getKnownRoutes } from './route-matrix';
import type { CoverageMatrix } from './route-matrix';

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

export interface ModuleReport {
  module: string;
  routesCovered: number;
  totalCalls: number;
  routes: { method: string; path: string; callCount: number; avgDurationMs: number }[];
  uncoveredRoutes: string[];
}

const MODULE_ROUTE_MAPPING: Record<string, RegExp[]> = {
  'module-0b-auth': [/^(POST|GET) \/auth\//],
  'module-1a-assessment': [/\/family\/learners/, /\/assessment/, /\/iep/],
  'module-1b-brain': [/\/brain\//],
  'module-2b-tutors': [/\/tutor\//, /\/billing\/tutor-add-ons/],
  'module-3a-homework': [/\/learning\/homework/],
  'module-3b-collaboration': [/\/comms\//],
  'module-4a-gamification': [/\/engagement\//],
};

export function generateModuleReport(moduleName: string): ModuleReport {
  const matrix = generateCoverageMatrix();

  const moduleRoutes = matrix.routes.filter((r) => r.modules.includes(moduleName));

  // Find uncovered known routes for this module
  const patterns = MODULE_ROUTE_MAPPING[moduleName] || [];
  const knownRoutes = getKnownRoutes();
  const relevantKnownRoutes = knownRoutes.filter((kr) => {
    return patterns.some((p) => p.test(kr));
  });

  const coveredPaths = new Set(moduleRoutes.map((r) => `${r.method} ${r.path}`));
  const uncoveredRoutes = relevantKnownRoutes.filter((kr) => !coveredPaths.has(kr));

  return {
    module: moduleName,
    routesCovered: moduleRoutes.length,
    totalCalls: moduleRoutes.reduce((sum, r) => sum + r.callCount, 0),
    routes: moduleRoutes.map((r) => ({
      method: r.method,
      path: r.path,
      callCount: r.callCount,
      avgDurationMs: r.avgDurationMs,
    })),
    uncoveredRoutes,
  };
}

export function generateFullReport(): void {
  const matrix = generateCoverageMatrix();
  const coverage = getCoveragePercentage();

  const modules = Object.keys(MODULE_ROUTE_MAPPING);
  const moduleReports: ModuleReport[] = modules.map((m) => generateModuleReport(m));

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRoutesExercised: matrix.totalRoutes,
      totalApiCalls: matrix.totalCalls,
      knownRouteCoverage: coverage,
    },
    modules: moduleReports,
  };

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'coverage-report.json'),
    JSON.stringify(report, null, 2),
  );

  // Also generate a human-readable summary
  const lines: string[] = [
    '=== AIVO E2E Coverage Report ===',
    `Generated: ${report.generatedAt}`,
    '',
    `API Route Coverage: ${coverage.covered}/${coverage.total} (${coverage.percentage}%)`,
    `Total API Calls: ${matrix.totalCalls}`,
    '',
    '--- Per-Module Breakdown ---',
  ];

  for (const mod of moduleReports) {
    lines.push('');
    lines.push(`[${mod.module}]`);
    lines.push(`  Routes covered: ${mod.routesCovered}`);
    lines.push(`  API calls: ${mod.totalCalls}`);
    if (mod.uncoveredRoutes.length > 0) {
      lines.push(`  Uncovered:`);
      for (const route of mod.uncoveredRoutes) {
        lines.push(`    - ${route}`);
      }
    }
  }

  fs.writeFileSync(path.join(REPORTS_DIR, 'coverage-summary.txt'), lines.join('\n'));
}

// Allow running directly
if (process.argv[1] === __filename) {
  generateFullReport();
  console.log('Coverage report generated in', REPORTS_DIR);
}
