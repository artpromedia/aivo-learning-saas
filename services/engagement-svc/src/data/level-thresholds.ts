/**
 * Level N requires 100 × N^1.5 total XP. Level cap: 100.
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate what level a learner is at given their total XP.
 */
export function calculateLevel(totalXp: number): number {
  for (let level = 100; level >= 1; level--) {
    if (totalXp >= xpRequiredForLevel(level)) {
      return level;
    }
  }
  return 1;
}

/**
 * Get progress towards the next level as a percentage (0-100).
 */
export function levelProgress(totalXp: number): {
  currentLevel: number;
  nextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevel(totalXp);
  const nextLevel = Math.min(100, currentLevel + 1);
  const currentLevelXp = xpRequiredForLevel(currentLevel);
  const nextLevelXp = xpRequiredForLevel(nextLevel);

  if (currentLevel >= 100) {
    return { currentLevel, nextLevel: 100, currentLevelXp, nextLevelXp, progressPercent: 100 };
  }

  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  return { currentLevel, nextLevel, currentLevelXp, nextLevelXp, progressPercent };
}

/**
 * Generate the full level thresholds table for reference.
 */
export function generateLevelTable(): Array<{ level: number; totalXpRequired: number }> {
  const table: Array<{ level: number; totalXpRequired: number }> = [];
  for (let level = 1; level <= 100; level++) {
    table.push({ level, totalXpRequired: xpRequiredForLevel(level) });
  }
  return table;
}
