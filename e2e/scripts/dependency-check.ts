import fs from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

interface ModuleDependency {
  module: string;
  dependsOn: string[];
}

interface DependencyCheckResult {
  passed: boolean;
  modules: {
    module: string;
    dependenciesMet: boolean;
    missingDependencies: string[];
    status: 'PASS' | 'FAIL' | 'SKIP';
  }[];
}

const MODULE_DEPENDENCY_GRAPH: ModuleDependency[] = [
  { module: 'module-0b-auth', dependsOn: [] },
  { module: 'module-1a-assessment', dependsOn: ['module-0b-auth'] },
  { module: 'module-1b-brain', dependsOn: ['module-1a-assessment'] },
  { module: 'module-2a-content-gen', dependsOn: ['module-1b-brain'] },
  { module: 'module-2b-tutors', dependsOn: ['module-1b-brain'] },
  { module: 'module-3a-homework', dependsOn: ['module-2b-tutors'] },
  { module: 'module-3b-collaboration', dependsOn: ['module-0b-auth'] },
  { module: 'module-4a-gamification', dependsOn: ['module-2b-tutors'] },
  { module: 'module-4b-avatar-shop', dependsOn: ['module-4a-gamification'] },
  { module: 'module-5a-enterprise', dependsOn: ['module-0b-auth'] },
  { module: 'integration', dependsOn: ['module-0b-auth', 'module-1a-assessment', 'module-1b-brain', 'module-2b-tutors', 'module-3b-collaboration'] },
];

interface TestResult {
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  name?: string;
  projectName?: string;
}

function loadTestResults(): Map<string, 'passed' | 'failed'> {
  const resultsFile = path.join(REPORTS_DIR, 'results.json');
  const moduleResults = new Map<string, 'passed' | 'failed'>();

  if (!fs.existsSync(resultsFile)) {
    return moduleResults;
  }

  try {
    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));

    const suites = data.suites || [];
    for (const suite of suites) {
      const specs = suite.specs || [];
      for (const spec of specs) {
        const tests = spec.tests || [];
        for (const test of tests) {
          const projectName = test.projectName || '';
          const status = test.status || test.expectedStatus;

          if (projectName) {
            const current = moduleResults.get(projectName);
            if (status === 'failed' || status === 'timedOut') {
              moduleResults.set(projectName, 'failed');
            } else if (!current) {
              moduleResults.set(projectName, 'passed');
            }
          }
        }
      }
    }
  } catch {
    // Results file couldn't be parsed
  }

  return moduleResults;
}

function checkDependencies(): DependencyCheckResult {
  const testResults = loadTestResults();
  const moduleChecks: DependencyCheckResult['modules'] = [];
  let allPassed = true;

  for (const { module, dependsOn } of MODULE_DEPENDENCY_GRAPH) {
    const missingDeps: string[] = [];
    let depsMet = true;

    for (const dep of dependsOn) {
      const depResult = testResults.get(dep);

      if (!depResult) {
        missingDeps.push(`${dep} (not run)`);
        depsMet = false;
      } else if (depResult === 'failed') {
        missingDeps.push(`${dep} (failed)`);
        depsMet = false;
      }
    }

    const moduleResult = testResults.get(module);
    let status: 'PASS' | 'FAIL' | 'SKIP';

    if (!depsMet) {
      status = 'FAIL';
      allPassed = false;
    } else if (!moduleResult) {
      status = 'SKIP';
    } else if (moduleResult === 'failed') {
      status = 'FAIL';
      allPassed = false;
    } else {
      status = 'PASS';
    }

    moduleChecks.push({
      module,
      dependenciesMet: depsMet,
      missingDependencies: missingDeps,
      status,
    });
  }

  return {
    passed: allPassed,
    modules: moduleChecks,
  };
}

function detectCycles(): string[][] {
  const cycles: string[][] = [];
  const graph = new Map<string, string[]>();

  for (const { module, dependsOn } of MODULE_DEPENDENCY_GRAPH) {
    graph.set(module, dependsOn);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(node: string): void {
    if (inStack.has(node)) {
      const cycleStart = currentPath.indexOf(node);
      cycles.push(currentPath.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    currentPath.push(node);

    const deps = graph.get(node) || [];
    for (const dep of deps) {
      dfs(dep);
    }

    currentPath.pop();
    inStack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node);
  }

  return cycles;
}

function main(): void {
  console.log('\n=== Dependency Check Report ===\n');

  const cycles = detectCycles();
  if (cycles.length > 0) {
    console.log('CRITICAL: Circular dependencies detected:');
    for (const cycle of cycles) {
      console.log(`  ${cycle.join(' -> ')}`);
    }
    console.log();
    process.exit(1);
  }
  console.log('No circular dependencies detected.\n');

  const result = checkDependencies();

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'dependency-check.json'),
    JSON.stringify(result, null, 2),
  );

  console.log('Module dependency status:');
  for (const mod of result.modules) {
    const icon = mod.status === 'PASS' ? 'PASS' : mod.status === 'SKIP' ? 'SKIP' : 'FAIL';
    console.log(`  [${icon}] ${mod.module}`);

    if (mod.missingDependencies.length > 0) {
      console.log(`    Missing: ${mod.missingDependencies.join(', ')}`);
    }
  }
  console.log();

  console.log(`Dependency graph: ${MODULE_DEPENDENCY_GRAPH.length} modules`);
  console.log(`Result: ${result.passed ? 'ALL DEPENDENCIES MET' : 'DEPENDENCY VIOLATIONS FOUND'}\n`);

  if (!result.passed) {
    process.exit(1);
  }
}

main();
