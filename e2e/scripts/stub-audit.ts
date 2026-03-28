import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_ROOT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const SRC_DIRS = ['services', 'packages', 'apps'];

const PATTERNS = [
  'TODO',
  'FIXME',
  'stub',
  'mock',
  'placeholder',
  'hardcoded',
  'dummy',
];

interface StubAuditResult {
  totalCount: number;
  fileCount: number;
  files: Record<string, { count: number; matches: string[] }>;
  byPattern: Record<string, number>;
}

function scanForStubs(): StubAuditResult {
  const result: StubAuditResult = {
    totalCount: 0,
    fileCount: 0,
    files: {},
    byPattern: {},
  };

  for (const pattern of PATTERNS) {
    result.byPattern[pattern] = 0;
  }

  for (const srcDir of SRC_DIRS) {
    const fullPath = path.join(PROJECT_ROOT, srcDir);
    if (!fs.existsSync(fullPath)) continue;

    for (const pattern of PATTERNS) {
      try {
        const grepResult = execSync(
          `grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "${pattern}" "${fullPath}" 2>/dev/null || true`,
          { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
        );

        const lines = grepResult.trim().split('\n').filter(Boolean);

        for (const line of lines) {
          const colonIdx = line.indexOf(':');
          if (colonIdx === -1) continue;

          const secondColon = line.indexOf(':', colonIdx + 1);
          const filePath = line.substring(0, colonIdx);
          const matchContent = secondColon > -1 ? line.substring(secondColon + 1).trim() : line.substring(colonIdx + 1).trim();

          if (filePath.includes('node_modules')) continue;
          if (filePath.includes('.spec.') || filePath.includes('.test.')) continue;
          if (filePath.includes('/e2e/')) continue;
          if (filePath.includes('__tests__') || filePath.includes('__mocks__')) continue;

          const relPath = path.relative(PROJECT_ROOT, filePath);

          if (!result.files[relPath]) {
            result.files[relPath] = { count: 0, matches: [] };
          }

          result.files[relPath].count++;
          if (result.files[relPath].matches.length < 5) {
            result.files[relPath].matches.push(`[${pattern}] ${matchContent.substring(0, 120)}`);
          }

          result.totalCount++;
          result.byPattern[pattern]++;
        }
      } catch {
        // grep failure is fine, means no matches
      }
    }
  }

  result.fileCount = Object.keys(result.files).length;
  return result;
}

function main(): void {
  console.log('\n=== Stub Audit Report ===\n');

  const result = scanForStubs();

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const fileCountMap: Record<string, number> = {};
  for (const [file, data] of Object.entries(result.files)) {
    fileCountMap[file] = data.count;
  }
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'stub-audit.json'),
    JSON.stringify(fileCountMap, null, 2),
  );

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'stub-audit-detail.json'),
    JSON.stringify(result, null, 2),
  );

  console.log(`Total stub/placeholder occurrences: ${result.totalCount}`);
  console.log(`Files affected: ${result.fileCount}`);
  console.log();

  console.log('By pattern:');
  for (const [pattern, count] of Object.entries(result.byPattern)) {
    if (count > 0) {
      console.log(`  ${pattern}: ${count}`);
    }
  }
  console.log();

  if (result.fileCount > 0) {
    console.log('Top files:');
    const sorted = Object.entries(result.files)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 20);

    for (const [file, data] of sorted) {
      console.log(`  ${file}: ${data.count} occurrences`);
      for (const match of data.matches) {
        console.log(`    ${match}`);
      }
    }
    console.log();
  }

  if (result.totalCount > 0) {
    console.log(`FAIL: ${result.totalCount} stubs/placeholders found in production code`);
    process.exit(1);
  } else {
    console.log('PASS: No stubs or placeholders found in production code');
  }
}

main();
