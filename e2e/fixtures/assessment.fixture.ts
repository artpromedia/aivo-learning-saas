import { request } from '@playwright/test';

const ASSESSMENT_API = process.env.ASSESSMENT_API_URL || 'http://localhost:3012';

let _assessmentAvailable: boolean | null = null;

export async function isAssessmentAvailable(): Promise<boolean> {
  if (_assessmentAvailable !== null) return _assessmentAvailable;
  try {
    const ctx = await request.newContext({ baseURL: ASSESSMENT_API });
    const res = await ctx.get('/health');
    _assessmentAvailable = res.ok();
    await ctx.dispose();
  } catch {
    _assessmentAvailable = false;
  }
  return _assessmentAvailable;
}
