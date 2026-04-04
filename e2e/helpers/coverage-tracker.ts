import { Page, Route } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export interface ApiCallRecord {
  method: string;
  url: string;
  path: string;
  status: number;
  timestamp: number;
  testName: string;
  module: string;
  durationMs: number;
}

const OUTPUT_DIR = path.resolve(__dirname, '..', 'reports');

class CoverageTracker {
  private calls: ApiCallRecord[] = [];
  private currentTest: string = '';
  private currentModule: string = '';

  setContext(testName: string, module: string): void {
    this.currentTest = testName;
    this.currentModule = module;
  }

  async attach(page: Page): Promise<void> {
    await page.route('**/api/**', async (route: Route) => {
      const request = route.request();
      const startTime = Date.now();

      await route.continue();

      try {
        const response = await request.response();
        const url = new URL(request.url());

        this.calls.push({
          method: request.method(),
          url: request.url(),
          path: url.pathname,
          status: response?.status() || 0,
          timestamp: startTime,
          testName: this.currentTest,
          module: this.currentModule,
          durationMs: Date.now() - startTime,
        });
      } catch {
        // Test ended before response completed — safe to ignore
      }
    });

    // Also intercept direct service calls
    page.on('response', (response) => {
      const url = new URL(response.url());
      const isApiCall =
        url.port === '3101' ||
        url.port === '3102' ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/auth/') ||
        url.pathname.startsWith('/brain/') ||
        url.pathname.startsWith('/billing/') ||
        url.pathname.startsWith('/family/') ||
        url.pathname.startsWith('/tutor/') ||
        url.pathname.startsWith('/learning/') ||
        url.pathname.startsWith('/engagement/');

      if (isApiCall) {
        this.calls.push({
          method: response.request().method(),
          url: response.url(),
          path: url.pathname,
          status: response.status(),
          timestamp: Date.now(),
          testName: this.currentTest,
          module: this.currentModule,
          durationMs: 0,
        });
      }
    });
  }

  getRecordedCalls(): ApiCallRecord[] {
    return [...this.calls];
  }

  getUniqueRoutes(): Map<string, Set<string>> {
    const routes = new Map<string, Set<string>>();
    for (const call of this.calls) {
      const key = `${call.method} ${call.path}`;
      if (!routes.has(key)) {
        routes.set(key, new Set());
      }
      routes.get(key)!.add(call.module);
    }
    return routes;
  }

  flush(): void {
    if (this.calls.length === 0) return;

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const outputFile = path.join(OUTPUT_DIR, 'api-coverage.json');

    let existing: ApiCallRecord[] = [];
    if (fs.existsSync(outputFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      } catch {
        // corrupted file, start fresh
      }
    }

    const merged = [...existing, ...this.calls];
    fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2));
    this.calls = [];
  }

  reset(): void {
    this.calls = [];
  }
}

export const coverageTracker = new CoverageTracker();
