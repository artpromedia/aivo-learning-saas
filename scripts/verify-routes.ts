#!/usr/bin/env tsx
/**
 * Route Wiring Verification — scans all Fastify and FastAPI route declarations
 * across services and compares them against the E2E coverage tracker output.
 *
 * Usage: npx tsx scripts/verify-routes.ts [coverage-json-path]
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

interface RouteDeclaration {
  method: string;
  path: string;
  file: string;
  line: number;
}

// Fastify route patterns: app.get|post|patch|delete|put("path", ...)
const FASTIFY_PATTERN =
  /app\.(get|post|patch|delete|put)\s*\(\s*["'`]([^"'`]+)["'`]/gi;

// FastAPI route patterns: @router.get|post|patch|delete|put("path")
const FASTAPI_PATTERN =
  /@router\.(get|post|patch|delete|put)\s*\(\s*["']([^"']+)["']/gi;

function scanDirectory(dir: string, ext: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === "__pycache__") continue;
    if (entry.includes("__tests__") || entry.includes(".test.") || entry.includes(".spec.")) continue;

    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...scanDirectory(full, ext));
    } else if (full.endsWith(ext)) {
      files.push(full);
    }
  }
  return files;
}

function scanFastifyRoutes(): RouteDeclaration[] {
  const routes: RouteDeclaration[] = [];
  const servicesDir = join(ROOT, "services");
  const tsFiles = scanDirectory(servicesDir, ".ts");

  for (const file of tsFiles) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");

    let match: RegExpExecArray | null;
    FASTIFY_PATTERN.lastIndex = 0;

    while ((match = FASTIFY_PATTERN.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const lineNum = content.substring(0, match.index).split("\n").length;
      routes.push({ method, path, file: relative(ROOT, file), line: lineNum });
    }
  }

  return routes;
}

function scanFastAPIRoutes(): RouteDeclaration[] {
  const routes: RouteDeclaration[] = [];
  const servicesDir = join(ROOT, "services");
  const pyFiles = scanDirectory(servicesDir, ".py");

  for (const file of pyFiles) {
    const content = readFileSync(file, "utf-8");

    let match: RegExpExecArray | null;
    FASTAPI_PATTERN.lastIndex = 0;

    while ((match = FASTAPI_PATTERN.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const lineNum = content.substring(0, match.index).split("\n").length;
      routes.push({ method, path, file: relative(ROOT, file), line: lineNum });
    }
  }

  return routes;
}

function main() {
  console.log("Scanning route declarations...\n");

  const fastifyRoutes = scanFastifyRoutes();
  const fastapiRoutes = scanFastAPIRoutes();
  const allRoutes = [...fastifyRoutes, ...fastapiRoutes];

  console.log(`Found ${fastifyRoutes.length} Fastify routes`);
  console.log(`Found ${fastapiRoutes.length} FastAPI routes`);
  console.log(`Total: ${allRoutes.length} routes\n`);

  // Group by service
  const byService: Record<string, RouteDeclaration[]> = {};
  for (const route of allRoutes) {
    const svc = route.file.split("/")[1] ?? "unknown";
    if (!byService[svc]) byService[svc] = [];
    byService[svc].push(route);
  }

  for (const [svc, routes] of Object.entries(byService).sort()) {
    console.log(`\n${svc} (${routes.length} routes):`);
    for (const r of routes.sort((a, b) => a.path.localeCompare(b.path))) {
      console.log(`  ${r.method.padEnd(7)} ${r.path}`);
    }
  }

  // Compare against coverage if provided
  const coveragePath = process.argv[2];
  if (coveragePath && existsSync(coveragePath)) {
    console.log(`\nComparing against coverage: ${coveragePath}`);
    const coverage = JSON.parse(readFileSync(coveragePath, "utf-8")) as {
      exercisedRoutes: Array<{ method: string; path: string }>;
    };

    const exercised = new Set(
      coverage.exercisedRoutes.map((r) => `${r.method}:${r.path}`),
    );

    const uncovered = allRoutes.filter(
      (r) => !exercised.has(`${r.method}:${r.path}`),
    );

    if (uncovered.length > 0) {
      console.log(`\nUNCOVERED ROUTES (${uncovered.length}):`);
      for (const r of uncovered) {
        console.log(`  ${r.method.padEnd(7)} ${r.path}  (${r.file}:${r.line})`);
      }
    } else {
      console.log("\nAll routes covered by E2E tests!");
    }
  }

  // Write route manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalRoutes: allRoutes.length,
    byService: Object.fromEntries(
      Object.entries(byService).map(([k, v]) => [k, v.length]),
    ),
    routes: allRoutes.map((r) => ({
      method: r.method,
      path: r.path,
      service: r.file.split("/")[1],
    })),
  };

  const { writeFileSync, mkdirSync } = require("node:fs");
  mkdirSync(join(ROOT, "e2e", "coverage-reports"), { recursive: true });
  writeFileSync(
    join(ROOT, "e2e", "coverage-reports", "route-manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log("\nRoute manifest written to e2e/coverage-reports/route-manifest.json");
}

main();
