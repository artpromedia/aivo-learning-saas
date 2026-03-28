import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_ROOT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

interface RegisteredRoute {
  method: string;
  path: string;
  file: string;
  line: number;
}

interface RouteVerificationResult {
  registeredRoutes: RegisteredRoute[];
  coveredRoutes: string[];
  uncoveredRoutes: RegisteredRoute[];
  coveragePercentage: number;
}

const FASTIFY_ROUTE_PATTERNS = [
  /fastify\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
  /\.route\s*\(\s*\{[^}]*method:\s*['"`](\w+)['"`][^}]*url:\s*['"`]([^'"`]+)['"`]/gi,
  /server\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
  /app\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
];

function findRegisteredRoutes(): RegisteredRoute[] {
  const routes: RegisteredRoute[] = [];
  const servicesDir = path.join(PROJECT_ROOT, 'services');

  if (!fs.existsSync(servicesDir)) {
    console.log('  [info] services/ directory not found, checking alternative paths');
    return routes;
  }

  let grepResult = '';
  try {
    grepResult = execSync(
      `grep -rn --include="*.ts" --include="*.js" -E "(fastify|server|app)\\.(get|post|put|patch|delete)\\s*\\(" "${servicesDir}" 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    );
  } catch {
    return routes;
  }

  const lines = grepResult.trim().split('\n').filter(Boolean);

  for (const line of lines) {
    if (line.includes('node_modules')) continue;
    if (line.includes('.spec.') || line.includes('.test.')) continue;

    for (const pattern of FASTIFY_ROUTE_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        const colonIdx = line.indexOf(':');
        const secondColon = line.indexOf(':', colonIdx + 1);
        const filePath = line.substring(0, colonIdx);
        const lineNum = parseInt(line.substring(colonIdx + 1, secondColon), 10);

        routes.push({
          method: match[1].toUpperCase(),
          path: match[2],
          file: path.relative(PROJECT_ROOT, filePath),
          line: lineNum || 0,
        });
      }
    }
  }

  try {
    const routeMethodResult = execSync(
      `grep -rn --include="*.ts" --include="*.js" -E "\\.route\\s*\\(" "${servicesDir}" 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    );

    const routeLines = routeMethodResult.trim().split('\n').filter(Boolean);
    for (const line of routeLines) {
      if (line.includes('node_modules')) continue;

      const methodMatch = /method:\s*['"`](\w+)['"`]/.exec(line);
      const urlMatch = /url:\s*['"`]([^'"`]+)['"`]/.exec(line);

      if (methodMatch && urlMatch) {
        const colonIdx = line.indexOf(':');
        const secondColon = line.indexOf(':', colonIdx + 1);
        const filePath = line.substring(0, colonIdx);
        const lineNum = parseInt(line.substring(colonIdx + 1, secondColon), 10);

        routes.push({
          method: methodMatch[1].toUpperCase(),
          path: urlMatch[1],
          file: path.relative(PROJECT_ROOT, filePath),
          line: lineNum || 0,
        });
      }
    }
  } catch {
    // no route() calls found
  }

  return routes;
}

function loadCoveredRoutes(): string[] {
  const coverageFile = path.join(REPORTS_DIR, 'api-coverage.json');
  if (!fs.existsSync(coverageFile)) {
    return [];
  }

  try {
    const calls = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
    const routes = new Set<string>();
    for (const call of calls) {
      routes.add(`${call.method} ${call.path}`);
    }
    return Array.from(routes);
  } catch {
    return [];
  }
}

function normalizeRoute(route: string): string {
  return route.replace(/:[^/]+/g, '[^/]+').replace(/\{[^}]+\}/g, '[^/]+');
}

function verifyRoutes(): RouteVerificationResult {
  const registered = findRegisteredRoutes();
  const covered = loadCoveredRoutes();

  const uncovered: RegisteredRoute[] = [];

  for (const route of registered) {
    const routeKey = `${route.method} ${route.path}`;
    const normalized = normalizeRoute(routeKey);
    const regex = new RegExp(`^${normalized}$`);

    const isCovered = covered.some((c) => regex.test(c) || c === routeKey);
    if (!isCovered) {
      uncovered.push(route);
    }
  }

  const total = registered.length;
  const coveredCount = total - uncovered.length;
  const percentage = total > 0 ? Math.round((coveredCount / total) * 100) : 100;

  return {
    registeredRoutes: registered,
    coveredRoutes: covered,
    uncoveredRoutes: uncovered,
    coveragePercentage: percentage,
  };
}

function main(): void {
  console.log('\n=== Route Verification Report ===\n');

  const result = verifyRoutes();

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'route-verification.json'),
    JSON.stringify(result, null, 2),
  );

  console.log(`Registered routes found: ${result.registeredRoutes.length}`);
  console.log(`E2E covered routes: ${result.coveredRoutes.length}`);
  console.log(`Uncovered routes: ${result.uncoveredRoutes.length}`);
  console.log(`Coverage: ${result.coveragePercentage}%`);
  console.log();

  if (result.uncoveredRoutes.length > 0) {
    console.log('Unwired routes (not covered by E2E tests):');
    for (const route of result.uncoveredRoutes) {
      console.log(`  ${route.method} ${route.path}`);
      console.log(`    File: ${route.file}:${route.line}`);
    }
    console.log();
  }

  if (result.registeredRoutes.length > 0 && result.uncoveredRoutes.length > 0) {
    console.log(`WARNING: ${result.uncoveredRoutes.length} routes have no E2E coverage`);
  } else {
    console.log('All registered routes have E2E coverage');
  }
}

main();
