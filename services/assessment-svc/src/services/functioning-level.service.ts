/**
 * Functioning Level Determination Service
 *
 * Scores parent questionnaire responses to derive initial functioning level signals
 * that inform the baseline assessment mode and starting ability estimate.
 */

import type { FunctioningLevel } from "../engine/irt.js";

interface ParentResponses {
  // Communication
  comm_verbal?: string;
  comm_complexity?: string;
  // Sensory
  sensory_visual?: number;
  sensory_audio?: number;
  sensory_preferences?: string[];
  // Learning
  learn_style?: string;
  learn_attention?: string;
  // Interests
  interests?: string[];
  motivators?: string;
  [key: string]: unknown;
}

interface FunctioningLevelSignals {
  communicationScore: number;
  sensoryScore: number;
  learningScore: number;
  overallLevel: FunctioningLevel;
  initialTheta: number;
  assessmentMode: string;
}

const COMMUNICATION_SCORES: Record<string, number> = {
  "Verbal speech": 5,
  "Combination of methods": 4,
  "Sign language": 3,
  "AAC device": 2,
  "Gestures and pointing": 1,
};

const COMPLEXITY_SCORES: Record<string, number> = {
  "Complex sentences": 5,
  "Simple sentences": 4,
  "2-3 word phrases": 3,
  "Single words": 2,
  "Varies by context": 3,
};

const ATTENTION_SCORES: Record<string, number> = {
  "30+ minutes": 5,
  "20-30 minutes": 4,
  "10-20 minutes": 3,
  "5-10 minutes": 2,
  "Less than 5 minutes": 1,
};

export function scoreFunctioningLevel(responses: ParentResponses): FunctioningLevelSignals {
  // Communication scoring (0-10)
  const commVerbal = COMMUNICATION_SCORES[responses.comm_verbal ?? ""] ?? 3;
  const commComplexity = COMPLEXITY_SCORES[responses.comm_complexity ?? ""] ?? 3;
  const communicationScore = commVerbal + commComplexity;

  // Sensory scoring (0-10)
  const sensoryVisual = typeof responses.sensory_visual === "number" ? responses.sensory_visual : 3;
  const sensoryAudio = typeof responses.sensory_audio === "number" ? responses.sensory_audio : 3;
  const sensoryPrefs = Array.isArray(responses.sensory_preferences) ? responses.sensory_preferences.length : 0;
  // More accommodations needed → lower score
  const sensoryScore = Math.max(0, Math.min(10, sensoryVisual + sensoryAudio - sensoryPrefs));

  // Learning scoring (0-5)
  const attentionScore = ATTENTION_SCORES[responses.learn_attention ?? ""] ?? 3;
  const learningScore = attentionScore;

  // Overall composite (0-25)
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

  return {
    communicationScore,
    sensoryScore,
    learningScore,
    overallLevel,
    initialTheta,
    assessmentMode,
  };
}
