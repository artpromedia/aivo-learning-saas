import { createHash, randomBytes } from "crypto";

export interface QuasiIdentifier {
  age?: number;
  grade?: string;
  disability?: string;
  zipCode?: string;
  gender?: string;
}

export interface LearnerRecord {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  quasiIdentifiers: QuasiIdentifier;
  metrics: Record<string, number>;
}

export interface AnonymizedRecord {
  hashedId: string;
  quasiIdentifiers: QuasiIdentifier;
  metrics: Record<string, number>;
}

export interface AnonymizationConfig {
  kLevel: number;
  epsilon: number;
  salt?: string;
}

export interface PrivacyBudget {
  cohortId: string;
  totalEpsilon: number;
  usedEpsilon: number;
  remainingEpsilon: number;
}

const MINIMUM_COHORT_SIZE = 30;

const AGE_BANDS: [number, number, string][] = [
  [0, 5, "0-5"],
  [6, 8, "6-8"],
  [9, 11, "9-11"],
  [12, 14, "12-14"],
  [15, 17, "15-17"],
  [18, 21, "18-21"],
  [22, 100, "22+"],
];

const GRADE_BANDS: Record<string, string> = {
  "Pre-K": "Early Childhood",
  "K": "Early Childhood",
  "1": "Lower Elementary",
  "2": "Lower Elementary",
  "3": "Lower Elementary",
  "4": "Upper Elementary",
  "5": "Upper Elementary",
  "6": "Middle School",
  "7": "Middle School",
  "8": "Middle School",
  "9": "High School",
  "10": "High School",
  "11": "High School",
  "12": "High School",
};

const DISABILITY_CATEGORIES: Record<string, string> = {
  "autism": "Developmental",
  "asd": "Developmental",
  "adhd": "Developmental",
  "intellectual_disability": "Cognitive",
  "specific_learning_disability": "Cognitive",
  "dyslexia": "Cognitive",
  "dyscalculia": "Cognitive",
  "speech_impairment": "Communication",
  "language_impairment": "Communication",
  "emotional_disturbance": "Behavioral",
  "behavioral_disorder": "Behavioral",
  "visual_impairment": "Sensory",
  "hearing_impairment": "Sensory",
  "deaf": "Sensory",
  "blind": "Sensory",
  "orthopedic_impairment": "Physical",
  "traumatic_brain_injury": "Physical",
  "other_health_impairment": "Other",
  "multiple_disabilities": "Multiple",
};

export function validateCohortSize(count: number): void {
  if (count < MINIMUM_COHORT_SIZE) {
    throw new Error(`Cohort size ${count} is below minimum threshold of ${MINIMUM_COHORT_SIZE}. Cannot proceed with anonymization.`);
  }
}

export function generalizeAge(age: number | undefined): string | undefined {
  if (age === undefined || age === null) return undefined;
  for (const [min, max, band] of AGE_BANDS) {
    if (age >= min && age <= max) return band;
  }
  return "Unknown";
}

export function generalizeGrade(grade: string | undefined): string | undefined {
  if (grade === undefined || grade === null) return undefined;
  return GRADE_BANDS[grade] ?? "Other";
}

export function generalizeDisability(disability: string | undefined): string | undefined {
  if (disability === undefined || disability === null) return undefined;
  const normalized = disability.toLowerCase().replace(/\s+/g, "_");
  return DISABILITY_CATEGORIES[normalized] ?? "Other";
}

export function generalizeQuasiIdentifiers(qi: QuasiIdentifier): QuasiIdentifier {
  return {
    age: undefined,
    grade: undefined,
    disability: undefined,
    zipCode: qi.zipCode ? qi.zipCode.substring(0, 3) + "**" : undefined,
    gender: qi.gender,
    ...(qi.age !== undefined ? { age: undefined } : {}),
    ...(qi.grade !== undefined ? { grade: undefined } : {}),
    ...(qi.disability !== undefined ? { disability: undefined } : {}),
  };
}

function generalizeRecord(record: LearnerRecord): { quasiIdentifiers: QuasiIdentifier; metrics: Record<string, number> } {
  const qi = record.quasiIdentifiers;
  return {
    quasiIdentifiers: {
      age: qi.age !== undefined ? undefined : undefined,
      grade: qi.grade !== undefined ? undefined : undefined,
      disability: qi.disability !== undefined ? undefined : undefined,
      zipCode: qi.zipCode ? qi.zipCode.substring(0, 3) + "**" : undefined,
      gender: qi.gender,
    },
    metrics: { ...record.metrics },
  };
}

export function applyKAnonymity(
  records: LearnerRecord[],
  kLevel: number,
): LearnerRecord[] {
  const generalized = records.map(r => ({
    ...r,
    quasiIdentifiers: {
      age: r.quasiIdentifiers.age !== undefined ? generalizeAge(r.quasiIdentifiers.age) as unknown as number : undefined,
      grade: generalizeGrade(r.quasiIdentifiers.grade),
      disability: generalizeDisability(r.quasiIdentifiers.disability),
      zipCode: r.quasiIdentifiers.zipCode ? r.quasiIdentifiers.zipCode.substring(0, 3) + "**" : undefined,
      gender: r.quasiIdentifiers.gender,
    },
  }));

  const groups = new Map<string, typeof generalized>();
  for (const record of generalized) {
    const key = JSON.stringify(record.quasiIdentifiers);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  const result: LearnerRecord[] = [];
  for (const [, group] of groups) {
    if (group.length >= kLevel) {
      result.push(...group);
    }
  }

  return result;
}

export function laplaceNoise(epsilon: number, sensitivity: number = 1.0): number {
  const u = Math.random() - 0.5;
  const scale = sensitivity / epsilon;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

export function addDifferentialPrivacy(
  value: number,
  epsilon: number,
  sensitivity: number = 1.0,
): number {
  const noise = laplaceNoise(epsilon, sensitivity);
  return value + noise;
}

export function addNoiseToMetrics(
  metrics: Record<string, number>,
  epsilon: number,
  sensitivity: number = 1.0,
): Record<string, number> {
  const noisy: Record<string, number> = {};
  const metricKeys = Object.keys(metrics);
  const perMetricEpsilon = epsilon / metricKeys.length;

  for (const key of metricKeys) {
    noisy[key] = addDifferentialPrivacy(metrics[key], perMetricEpsilon, sensitivity);
  }

  return noisy;
}

export function hashIdentifier(id: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${id}`).digest("hex");
}

export function stripPii(record: LearnerRecord): Omit<LearnerRecord, "email" | "name" | "phone"> {
  const { email, name, phone, ...stripped } = record;
  return stripped;
}

export function generateExportSalt(): string {
  return randomBytes(32).toString("hex");
}

export function anonymizeRecords(
  records: LearnerRecord[],
  config: AnonymizationConfig,
): AnonymizedRecord[] {
  validateCohortSize(records.length);

  const salt = config.salt ?? generateExportSalt();

  const kAnonymized = applyKAnonymity(records, config.kLevel);

  const anonymized: AnonymizedRecord[] = kAnonymized.map(record => {
    const stripped = stripPii(record);
    const noisyMetrics = addNoiseToMetrics(stripped.metrics, config.epsilon);
    const hashedId = hashIdentifier(stripped.id, salt);

    return {
      hashedId,
      quasiIdentifiers: stripped.quasiIdentifiers,
      metrics: noisyMetrics,
    };
  });

  return anonymized;
}

export class PrivacyBudgetTracker {
  private budgets: Map<string, PrivacyBudget> = new Map();
  private maxEpsilon: number;

  constructor(maxEpsilon: number = 10.0) {
    this.maxEpsilon = maxEpsilon;
  }

  getBudget(cohortId: string): PrivacyBudget {
    const existing = this.budgets.get(cohortId);
    if (existing) return existing;

    const budget: PrivacyBudget = {
      cohortId,
      totalEpsilon: this.maxEpsilon,
      usedEpsilon: 0,
      remainingEpsilon: this.maxEpsilon,
    };
    this.budgets.set(cohortId, budget);
    return budget;
  }

  consume(cohortId: string, epsilon: number): boolean {
    const budget = this.getBudget(cohortId);
    if (epsilon > budget.remainingEpsilon) {
      return false;
    }
    budget.usedEpsilon += epsilon;
    budget.remainingEpsilon = budget.totalEpsilon - budget.usedEpsilon;
    return true;
  }

  hasRemainingBudget(cohortId: string, epsilon: number): boolean {
    const budget = this.getBudget(cohortId);
    return epsilon <= budget.remainingEpsilon;
  }

  async loadFromRedis(redis: { get: (key: string) => Promise<string | null> }, cohortId: string): Promise<PrivacyBudget> {
    const key = `privacy_budget:${cohortId}`;
    const stored = await redis.get(key);
    if (stored) {
      const parsed = JSON.parse(stored) as PrivacyBudget;
      this.budgets.set(cohortId, parsed);
      return parsed;
    }
    return this.getBudget(cohortId);
  }

  async saveToRedis(redis: { set: (key: string, value: string) => Promise<unknown> }, cohortId: string): Promise<void> {
    const budget = this.getBudget(cohortId);
    const key = `privacy_budget:${cohortId}`;
    await redis.set(key, JSON.stringify(budget));
  }
}
