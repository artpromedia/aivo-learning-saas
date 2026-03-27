export const SM2_CONFIG = {
  /** Default easiness factor for new items */
  defaultEasinessFactor: 2.5,
  /** Minimum easiness factor (items never get easier than this) */
  minEasinessFactor: 1.3,
  /** Default interval in days for the first correct review */
  firstInterval: 1,
  /** Default interval in days for the second correct review */
  secondInterval: 6,
  /** Minimum quality rating to count as correct (0-5 scale) */
  passingQuality: 3,
} as const;

/**
 * Maps session performance (0-1 score) to SM-2 quality rating (0-5).
 */
export function scoreToQuality(score: number): number {
  if (score >= 0.95) return 5; // Perfect
  if (score >= 0.85) return 4; // Correct with minor hesitation
  if (score >= 0.7) return 3; // Correct with difficulty
  if (score >= 0.5) return 2; // Incorrect but close
  if (score >= 0.2) return 1; // Incorrect
  return 0; // No response / complete failure
}

/**
 * Calculates the new easiness factor based on the SM-2 formula.
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * Minimum EF is 1.3.
 */
export function calculateNewEasinessFactor(
  currentEF: number,
  quality: number,
): number {
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEF = currentEF + delta;
  return Math.max(SM2_CONFIG.minEasinessFactor, newEF);
}

/**
 * Calculates the next interval based on SM-2 algorithm.
 * - repetition 0 → 1 day
 * - repetition 1 → 6 days
 * - repetition n → previous_interval * easiness_factor
 */
export function calculateNextInterval(
  repetitionCount: number,
  previousInterval: number,
  easinessFactor: number,
): number {
  if (repetitionCount === 0) return SM2_CONFIG.firstInterval;
  if (repetitionCount === 1) return SM2_CONFIG.secondInterval;
  return Math.round(previousInterval * easinessFactor);
}
