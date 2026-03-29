import { request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

export type FunctioningLevel = 1 | 2 | 3 | 4 | 5;

export interface TestLearner {
  id: string;
  name: string;
  parentId: string;
  functioningLevel: FunctioningLevel;
  gradeLevel: string;
}

const GRADE_BY_LEVEL: Record<FunctioningLevel, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '5th',
  5: '7th',
};

export async function createTestLearner(
  parentToken: string,
  functioningLevel: FunctioningLevel,
  overrides: Partial<{ name: string; gradeLevel: string }> = {},
): Promise<TestLearner> {
  const ctx = await request.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: {
      Authorization: `Bearer ${parentToken}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });

  const learnerName = overrides.name || `Test Learner L${functioningLevel} ${Date.now().toString(36)}`;
  const gradeLevel = overrides.gradeLevel || GRADE_BY_LEVEL[functioningLevel];

  const response = await ctx.post('/family/learners', {
    data: {
      name: learnerName,
      dateOfBirth: '2016-06-15',
      gradeLevel,
      functioningLevel,
      specialNeeds: functioningLevel <= 2 ? ['speech', 'motor'] : [],
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Failed to create learner: ${response.status()} ${body}`);
  }

  const data = await response.json();

  await ctx.dispose();

  return {
    id: data.learner?.id || data.id,
    name: learnerName,
    parentId: data.learner?.parentId || data.parentId,
    functioningLevel,
    gradeLevel,
  };
}

export async function createLearnersForAllLevels(
  parentToken: string,
): Promise<Map<FunctioningLevel, TestLearner>> {
  const learners = new Map<FunctioningLevel, TestLearner>();
  const levels: FunctioningLevel[] = [1, 2, 3, 4, 5];

  for (const level of levels) {
    const learner = await createTestLearner(parentToken, level);
    learners.set(level, learner);
  }

  return learners;
}
