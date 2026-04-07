/**
 * Break configuration extraction from parent assessment responses.
 *
 * Maps parent answers for sn-2 (break frequency) and sn-3 (break type)
 * into a structured BreakConfig used by the baseline assessment flow.
 */

export type BreakActivityType =
  | "music"
  | "puzzle"
  | "game"
  | "breathing"
  | "stretch"
  | "fidget";

export interface BreakConfig {
  /** How many questions between breaks */
  frequencyQuestions: number;
  /** Ordered list of preferred break types to rotate through */
  preferredTypes: BreakActivityType[];
  /** Whether adaptive early breaks are enabled (e.g. after consecutive wrong answers) */
  adaptiveBreaks: boolean;
}

const DEFAULT_BREAK_CONFIG: BreakConfig = {
  frequencyQuestions: 8,
  preferredTypes: ["music", "puzzle", "game"],
  adaptiveBreaks: true,
};

/**
 * Map parent's sn-2 answer ("How many questions before a break?") to a number.
 */
function mapBreakFrequency(parentResponses: Record<string, unknown>): number {
  const answer = parentResponses["sn-2"] as string | undefined;
  if (!answer) return DEFAULT_BREAK_CONFIG.frequencyQuestions;

  if (answer.startsWith("20+")) return 20;
  if (answer.startsWith("10-20")) return 10;
  if (answer.startsWith("5-10")) return 8;
  if (answer.startsWith("3-5")) return 4;
  if (answer.startsWith("1-2")) return 2;
  if (answer.includes("frequent") || answer.includes("after each")) return 1;

  return DEFAULT_BREAK_CONFIG.frequencyQuestions;
}

/**
 * Map parent's sn-3 multi-select answers ("What type of breaks?") to activity types.
 *
 * sn-3 options from parent-assessment-questions.ts:
 *   "Movement breaks (stretching, walking)"      → stretch
 *   "Sensory breaks (calming music, visuals)"     → music
 *   "Quiet rest (close eyes, dark room)"          → breathing
 *   "Preferred activity break (watch video, play)" → game
 *   "Deep pressure/weighted blanket"              → breathing (closest calming match)
 *   "Snack break"                                 → (skip — not a digital activity)
 *   "Social interaction break"                    → game
 *   "No specific break type needed"               → all defaults
 *
 * Additional future options from the task spec:
 *   "Fun activity breaks (simple games)"          → game
 *   "Puzzle or brain teaser breaks"               → puzzle
 *   "Deep breathing exercises"                    → breathing
 *   "Fidget or tactile activities"                → fidget
 *   "Short video or story breaks"                 → music
 */
function mapBreakTypes(parentResponses: Record<string, unknown>): BreakActivityType[] {
  const answer = parentResponses["sn-3"];
  const selections: string[] = Array.isArray(answer)
    ? answer
    : typeof answer === "string"
      ? [answer]
      : [];

  if (selections.length === 0) return [...DEFAULT_BREAK_CONFIG.preferredTypes];

  // Check for "no specific" — use all defaults
  if (selections.some((s) => s.includes("No specific"))) {
    return [...DEFAULT_BREAK_CONFIG.preferredTypes];
  }

  const types = new Set<BreakActivityType>();

  for (const sel of selections) {
    const lower = sel.toLowerCase();

    // Movement → stretch
    if (lower.includes("movement") || lower.includes("stretching") || lower.includes("walking")) {
      types.add("stretch");
    }
    // Sensory / calming music → music
    if (lower.includes("sensory") || lower.includes("calming music") || lower.includes("visuals")) {
      types.add("music");
    }
    // Quiet rest / deep pressure → breathing
    if (lower.includes("quiet rest") || lower.includes("deep pressure") || lower.includes("close eyes")) {
      types.add("breathing");
    }
    // Activity break / video / play → game
    if (lower.includes("activity break") || lower.includes("watch video") || lower.includes("play")
        || lower.includes("simple games") || lower.includes("social interaction")) {
      types.add("game");
    }
    // Puzzle / brain teaser → puzzle
    if (lower.includes("puzzle") || lower.includes("brain teaser")) {
      types.add("puzzle");
    }
    // Deep breathing → breathing
    if (lower.includes("deep breathing") || lower.includes("breathing exercises")) {
      types.add("breathing");
    }
    // Fidget / tactile → fidget
    if (lower.includes("fidget") || lower.includes("tactile")) {
      types.add("fidget");
    }
    // Short video / story → music (closest audio/visual match)
    if (lower.includes("short video") || lower.includes("story break")) {
      types.add("music");
    }
  }

  return types.size > 0 ? [...types] : [...DEFAULT_BREAK_CONFIG.preferredTypes];
}

/**
 * Extract a full BreakConfig from parent assessment responses.
 */
export function extractBreakConfig(parentResponses: Record<string, unknown>): BreakConfig {
  return {
    frequencyQuestions: mapBreakFrequency(parentResponses),
    preferredTypes: mapBreakTypes(parentResponses),
    adaptiveBreaks: true,
  };
}

/** Stress-relief break types used for adaptive breaks (consecutive wrong answers). */
export const ADAPTIVE_BREAK_TYPES: BreakActivityType[] = ["music", "breathing"];

/**
 * Determine whether an adaptive (emotional support) break should trigger.
 * Returns true if the learner has answered >= threshold questions wrong in a row.
 */
export function shouldAdaptiveBreak(consecutiveWrong: number, threshold = 3): boolean {
  return consecutiveWrong >= threshold;
}

/**
 * Pick a calming break type for an adaptive (stress-relief) break.
 */
export function pickAdaptiveBreakType(rotationIndex: number): BreakActivityType {
  return ADAPTIVE_BREAK_TYPES[rotationIndex % ADAPTIVE_BREAK_TYPES.length];
}
