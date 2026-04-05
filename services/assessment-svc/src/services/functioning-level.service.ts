/**
 * Functioning Level Determination Service
 *
 * Scores parent questionnaire responses to derive initial functioning level signals
 * that inform the baseline assessment mode and starting ability estimate.
 *
 * Uses routing weights and flag triggers from the question bank to determine
 * assessment type (STANDARD / STANDARD_WITH_ACCOMMODATIONS / MODIFIED / ALTERNATE).
 */

import type { FunctioningLevel } from "../engine/irt.js";
import {
  PARENT_ASSESSMENT_QUESTIONS,
  type ParentAssessmentCategory,
} from "../lib/parent-assessment-questions.js";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ParentAssessmentType =
  | "STANDARD"
  | "STANDARD_WITH_ACCOMMODATIONS"
  | "MODIFIED"
  | "ALTERNATE";

interface FunctioningLevelSignals {
  communicationScore: number;
  sensoryScore: number;
  learningScore: number;
  overallLevel: FunctioningLevel;
  initialTheta: number;
  assessmentMode: string;
  /** Assessment type based on flag trigger routing */
  assessmentType: ParentAssessmentType;
  /** 0-100 support level score */
  supportLevel: number;
  /** Number of routing-critical flags triggered */
  flagCount: number;
  /** Which flags were triggered */
  triggeredFlags: string[];
  /** IEP/504 info extracted from responses */
  hasExistingIep: boolean;
  hasExisting504: boolean;
}

// ─── Scoring ────────────────────────────────────────────────────────────────────

/**
 * Count how many routing-critical flag triggers were activated.
 * These are specific answer values on high-weight questions that indicate
 * the learner may need a non-standard assessment mode.
 */
function countFlagTriggers(responses: Record<string, unknown>): {
  flagCount: number;
  triggeredFlags: string[];
  weightedScore: number;
} {
  const triggeredFlags: string[] = [];
  let weightedScore = 0;

  for (const question of PARENT_ASSESSMENT_QUESTIONS) {
    if (!question.flagTriggers || !question.routingWeight) continue;
    const response = responses[question.id];
    if (response === undefined || response === null) continue;

    // Check single-value selections
    if (typeof response === "string") {
      if (question.flagTriggers.includes(response)) {
        triggeredFlags.push(`${question.id}: ${response}`);
        weightedScore += question.routingWeight;
      }
    }

    // Check multi-select arrays
    if (Array.isArray(response)) {
      for (const val of response) {
        if (typeof val === "string" && question.flagTriggers.includes(val)) {
          triggeredFlags.push(`${question.id}: ${val}`);
          weightedScore += question.routingWeight;
        }
      }
    }
  }

  return { flagCount: triggeredFlags.length, triggeredFlags, weightedScore };
}

/** Determine assessment type based on flag trigger count */
function determineAssessmentType(flagCount: number): ParentAssessmentType {
  if (flagCount === 0) return "STANDARD";
  if (flagCount <= 3) return "STANDARD_WITH_ACCOMMODATIONS";
  if (flagCount <= 6) return "MODIFIED";
  return "ALTERNATE";
}

/** Calculate support level on 0-100 scale based on weighted flag triggers */
function calculateSupportLevel(weightedScore: number): number {
  // Max possible weighted score ≈ 200 (all flags triggered × weights)
  // Normalize to 0-100 where 100 = maximum support needed
  return Math.min(100, Math.round((weightedScore / 100) * 100));
}

/** Extract IEP/504 status from fl-1 response */
function extractIepStatus(responses: Record<string, unknown>): {
  hasExistingIep: boolean;
  hasExisting504: boolean;
} {
  const fl1 = responses["fl-1"] as string | undefined;
  if (!fl1) return { hasExistingIep: false, hasExisting504: false };

  const hasExistingIep = fl1.startsWith("Yes, IEP");
  const hasExisting504 = fl1 === "Yes, 504 plan only";
  return { hasExistingIep, hasExisting504 };
}

/** Extract communication score from new question format */
function scoreCommunication(responses: Record<string, unknown>): number {
  let score = 10; // Start at max, subtract for needs

  // cn-1: Primary communication method
  const cn1 = responses["cn-1"] as string | undefined;
  const cnScores: Record<string, number> = {
    "Verbal speech (speaks clearly)": 0,
    "Verbal speech (limited vocabulary or clarity)": -2,
    "Sign language": -3,
    "Combination of methods": -2,
    "Picture symbols (PECS, Boardmaker, etc.)": -5,
    "Communication device/app (AAC)": -5,
    "Gestures and pointing": -6,
    "Non-verbal / Pre-verbal": -8,
  };
  score += cnScores[cn1 ?? ""] ?? 0;

  // fl-4: Response method
  const fl4 = responses["fl-4"] as string | undefined;
  const fl4Scores: Record<string, number> = {
    "Verbally answers questions clearly": 0,
    "Uses short words or phrases": -1,
    "Points to or touches choices": -2,
    "Uses communication device or pictures": -3,
    "Looks at or gazes toward choices": -5,
    "Requires adult to interpret responses": -6,
    "Does not consistently respond to questions": -8,
  };
  score += fl4Scores[fl4 ?? ""] ?? 0;

  return Math.max(0, Math.min(10, Math.round(score / 2 + 5)));
}

/** Extract sensory score from new question format */
function scoreSensory(responses: Record<string, unknown>): number {
  let score = 10;

  // sa-1: Vision impairment
  const sa1 = responses["sa-1"] as string | undefined;
  const visionScores: Record<string, number> = {
    "No vision impairment": 0,
    "Wears glasses/contacts (corrected to normal)": 0,
    "Low vision (even with glasses)": -3,
    "Legally blind": -6,
    "Totally blind": -8,
  };
  score += visionScores[sa1 ?? ""] ?? 0;

  // sa-3: Hearing impairment
  const sa3 = responses["sa-3"] as string | undefined;
  const hearingScores: Record<string, number> = {
    "No hearing impairment": 0,
    "Mild hearing loss (uses hearing aids)": -1,
    "Moderate hearing loss": -3,
    "Severe hearing loss": -5,
    "Profoundly deaf": -7,
    "Deaf since birth": -7,
  };
  score += hearingScores[sa3 ?? ""] ?? 0;

  // sa-5: Deafblind
  if (responses["sa-5"] === "Yes") score -= 5;

  return Math.max(0, Math.min(10, Math.round(score / 2 + 5)));
}

/** Extract learning/attention score from new question format */
function scoreLearning(responses: Record<string, unknown>): number {
  let score = 5;

  // ls-3: Focus duration (1-5 scale)
  const ls3 = typeof responses["ls-3"] === "number" ? responses["ls-3"] : 3;
  score = ls3;

  // fl-2: Following instructions reduces score
  const fl2 = responses["fl-2"] as string | undefined;
  if (fl2 === "Rarely, requires significant support") score -= 2;
  if (fl2 === "No, requires physical guidance or demonstration") score -= 3;

  return Math.max(0, Math.min(5, score));
}

// ─── Main Scoring Function ──────────────────────────────────────────────────────

export function scoreFunctioningLevel(responses: Record<string, unknown>): FunctioningLevelSignals {
  const communicationScore = scoreCommunication(responses);
  const sensoryScore = scoreSensory(responses);
  const learningScore = scoreLearning(responses);

  // Flag trigger routing analysis
  const { flagCount, triggeredFlags, weightedScore } = countFlagTriggers(responses);
  const assessmentType = determineAssessmentType(flagCount);
  const supportLevel = calculateSupportLevel(weightedScore);
  const { hasExistingIep, hasExisting504 } = extractIepStatus(responses);

  // Overall composite still used for functioning level determination (0-25)
  const composite = communicationScore + sensoryScore + learningScore;

  let overallLevel: FunctioningLevel;
  let initialTheta: number;
  let assessmentMode: string;

  if (composite >= 20) {
    overallLevel = "STANDARD";
    initialTheta = 0.5;
    assessmentMode = "STANDARD";
  } else if (composite >= 15) {
    overallLevel = "SUPPORTED";
    initialTheta = 0.0;
    assessmentMode = "MODIFIED";
  } else if (composite >= 10) {
    overallLevel = "LOW_VERBAL";
    initialTheta = -0.5;
    assessmentMode = "PICTURE_BASED";
  } else if (composite >= 5) {
    overallLevel = "NON_VERBAL";
    initialTheta = -1.0;
    assessmentMode = "PARTNER_ASSISTED";
  } else {
    overallLevel = "PRE_SYMBOLIC";
    initialTheta = -2.0;
    assessmentMode = "OBSERVATIONAL";
  }

  // Override assessment mode based on routing flags where appropriate
  if (assessmentType === "ALTERNATE" && assessmentMode === "STANDARD") {
    assessmentMode = "MODIFIED";
    initialTheta = Math.min(initialTheta, 0.0);
  }

  return {
    communicationScore,
    sensoryScore,
    learningScore,
    overallLevel,
    initialTheta,
    assessmentMode,
    assessmentType,
    supportLevel,
    flagCount,
    triggeredFlags,
    hasExistingIep,
    hasExisting504,
  };
}

// ─── Insight Extraction ─────────────────────────────────────────────────────────

/** Extract insight notes from each category for storage */
export function extractInsightNotes(responses: Record<string, unknown>): {
  learningStyleNotes: string;
  strengthsNotes: string;
  challengesNotes: string;
  behaviorNotes: string;
} {
  const byCategory: Record<string, string[]> = {};

  for (const question of PARENT_ASSESSMENT_QUESTIONS) {
    const response = responses[question.id];
    if (response === undefined || response === null || response === "") continue;

    const cat = question.category;
    if (!byCategory[cat]) byCategory[cat] = [];

    const label = question.questionText.slice(0, 60);
    if (Array.isArray(response)) {
      byCategory[cat].push(`${label}: ${response.join(", ")}`);
    } else {
      byCategory[cat].push(`${label}: ${response}`);
    }
  }

  return {
    learningStyleNotes: (byCategory["learning_style"] ?? []).join("\n"),
    strengthsNotes: (byCategory["strengths"] ?? []).join("\n"),
    challengesNotes: (byCategory["challenges"] ?? []).join("\n"),
    behaviorNotes: (byCategory["behavior"] ?? []).join("\n"),
  };
}
