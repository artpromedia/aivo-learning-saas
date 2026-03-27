import { describe, it, expect } from "vitest";
import { XP_AWARDS, calculateStreakXp, calculateHomeworkXp, calculateChallengeXp } from "../data/xp-awards.js";
import { calculateLevel, xpRequiredForLevel, levelProgress, generateLevelTable } from "../data/level-thresholds.js";

describe("XP Awards Table", () => {
  it("has award rules for all required events", () => {
    const requiredEvents = [
      "lesson.completed", "quiz.completed", "quiz.perfect_score",
      "engagement.streak.extended", "focus.session_30min", "focus.session_90min",
      "brain.iep_goal.met", "engagement.peer_help", "engagement.shop.purchased",
      "break.completed", "quest.chapter.completed", "homework.session.completed",
      "tutor.session.completed", "engagement.challenge.completed",
    ];
    for (const event of requiredEvents) {
      expect(XP_AWARDS[event]).toBeDefined();
    }
  });

  it("awards 10 XP for lesson.completed", () => {
    expect(XP_AWARDS["lesson.completed"].xp).toBe(10);
    expect(XP_AWARDS["lesson.completed"].coins).toBe(5);
  });

  it("awards 25 XP for quiz.completed", () => {
    expect(XP_AWARDS["quiz.completed"].xp).toBe(25);
    expect(XP_AWARDS["quiz.completed"].coins).toBe(10);
  });

  it("awards 50 XP for quiz.perfect_score", () => {
    expect(XP_AWARDS["quiz.perfect_score"].xp).toBe(50);
    expect(XP_AWARDS["quiz.perfect_score"].coins).toBe(25);
  });

  it("awards 5 XP for break.completed", () => {
    expect(XP_AWARDS["break.completed"].xp).toBe(5);
    expect(XP_AWARDS["break.completed"].coins).toBe(2);
  });

  it("awards 15 XP for tutor.session.completed", () => {
    expect(XP_AWARDS["tutor.session.completed"].xp).toBe(15);
  });
});

describe("Dynamic XP Calculations", () => {
  describe("calculateStreakXp", () => {
    it("calculates 5 × streak_day", () => {
      expect(calculateStreakXp(3)).toEqual({ xp: 15, coins: 3 });
    });

    it("caps at 50 XP", () => {
      expect(calculateStreakXp(20)).toEqual({ xp: 50, coins: 3 });
    });

    it("returns 5 XP for day 1", () => {
      expect(calculateStreakXp(1)).toEqual({ xp: 5, coins: 3 });
    });
  });

  describe("calculateHomeworkXp", () => {
    it("calculates quality × 30 for XP", () => {
      expect(calculateHomeworkXp(1.0)).toEqual({ xp: 30, coins: 15 });
    });

    it("scales down for lower quality", () => {
      expect(calculateHomeworkXp(0.5)).toEqual({ xp: 15, coins: 8 });
    });

    it("returns 0 for zero quality", () => {
      expect(calculateHomeworkXp(0)).toEqual({ xp: 0, coins: 0 });
    });
  });

  describe("calculateChallengeXp", () => {
    it("awards 30 XP + 15 coins for winner", () => {
      expect(calculateChallengeXp(true)).toEqual({ xp: 30, coins: 15 });
    });

    it("awards 15 XP + 5 coins for participant", () => {
      expect(calculateChallengeXp(false)).toEqual({ xp: 15, coins: 5 });
    });
  });
});

describe("Level Thresholds", () => {
  it("level 1 requires 0 XP", () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it("level 2 requires 100 × 2^1.5 ≈ 283 XP", () => {
    expect(xpRequiredForLevel(2)).toBe(Math.floor(100 * Math.pow(2, 1.5)));
  });

  it("XP requirement increases with level", () => {
    for (let l = 2; l <= 10; l++) {
      expect(xpRequiredForLevel(l)).toBeGreaterThan(xpRequiredForLevel(l - 1));
    }
  });

  it("calculates correct level from XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(50)).toBe(1);
    expect(calculateLevel(xpRequiredForLevel(5))).toBe(5);
    expect(calculateLevel(xpRequiredForLevel(10))).toBe(10);
  });

  it("returns level 1 for negative/zero XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("caps at level 100", () => {
    expect(calculateLevel(999999999)).toBe(100);
  });

  it("levelProgress returns correct percentages", () => {
    const progress = levelProgress(0);
    expect(progress.currentLevel).toBe(1);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
    expect(progress.progressPercent).toBeLessThanOrEqual(100);
  });

  it("levelProgress shows 100% at max level", () => {
    const progress = levelProgress(xpRequiredForLevel(100));
    expect(progress.currentLevel).toBe(100);
    expect(progress.progressPercent).toBe(100);
  });

  it("generates complete level table with 100 entries", () => {
    const table = generateLevelTable();
    expect(table).toHaveLength(100);
    expect(table[0].level).toBe(1);
    expect(table[99].level).toBe(100);
  });
});
