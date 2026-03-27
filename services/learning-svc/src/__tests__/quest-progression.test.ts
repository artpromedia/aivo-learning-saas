import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ALL_QUEST_WORLDS,
  getQuestWorldBySlug,
  getGradeBand,
  getChapterSkills,
} from "../data/quest-worlds/index.js";

describe("Quest World Data", () => {
  it("has exactly 5 quest worlds", () => {
    expect(ALL_QUEST_WORLDS).toHaveLength(5);
  });

  it("covers all 5 subjects", () => {
    const subjects = ALL_QUEST_WORLDS.map((w) => w.subject).sort();
    expect(subjects).toEqual(["coding", "history", "math", "reading", "science"]);
  });

  it("each world has 10 chapters", () => {
    for (const world of ALL_QUEST_WORLDS) {
      expect(world.chapters).toHaveLength(10);
    }
  });

  it("each world has boss chapters at 3, 6, 9, 10", () => {
    for (const world of ALL_QUEST_WORLDS) {
      const bossChapters = world.chapters
        .filter((c) => c.hasBoss)
        .map((c) => c.number);
      expect(bossChapters).toEqual([3, 6, 9, 10]);
    }
  });

  it("each world has a unique slug", () => {
    const slugs = ALL_QUEST_WORLDS.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(5);
  });

  it("each world has all grade bands (K-2, 3-5, 6-8, 9-12)", () => {
    for (const world of ALL_QUEST_WORLDS) {
      expect(Object.keys(world.gradeBands)).toEqual(
        expect.arrayContaining(["K-2", "3-5", "6-8", "9-12"]),
      );
    }
  });

  it("each grade band has 10 skills", () => {
    for (const world of ALL_QUEST_WORLDS) {
      for (const [band, config] of Object.entries(world.gradeBands)) {
        expect(config.skills).toHaveLength(10);
      }
    }
  });
});

describe("getQuestWorldBySlug", () => {
  it("returns the correct world for a valid slug", () => {
    const world = getQuestWorldBySlug("math-cosmos");
    expect(world).toBeDefined();
    expect(world!.title).toBe("Nova's Cosmos");
  });

  it("returns undefined for invalid slug", () => {
    expect(getQuestWorldBySlug("nonexistent")).toBeUndefined();
  });
});

describe("getGradeBand", () => {
  it("returns K-2 for null grade", () => {
    expect(getGradeBand(null)).toBe("K-2");
  });

  it("returns K-2 for grades 0-2", () => {
    expect(getGradeBand(0)).toBe("K-2");
    expect(getGradeBand(1)).toBe("K-2");
    expect(getGradeBand(2)).toBe("K-2");
  });

  it("returns 3-5 for grades 3-5", () => {
    expect(getGradeBand(3)).toBe("3-5");
    expect(getGradeBand(5)).toBe("3-5");
  });

  it("returns 6-8 for grades 6-8", () => {
    expect(getGradeBand(6)).toBe("6-8");
    expect(getGradeBand(8)).toBe("6-8");
  });

  it("returns 9-12 for grades 9+", () => {
    expect(getGradeBand(9)).toBe("9-12");
    expect(getGradeBand(12)).toBe("9-12");
  });
});

describe("getChapterSkills", () => {
  it("returns skills for a chapter based on grade band", () => {
    const world = getQuestWorldBySlug("math-cosmos")!;
    const skills = getChapterSkills(world, 1, 4); // Grade 4 = "3-5"

    expect(skills.length).toBeGreaterThan(0);
    // Skills should come from the 3-5 band
    const band35Skills = world.gradeBands["3-5"].skills;
    for (const skill of skills) {
      expect(band35Skills).toContain(skill);
    }
  });

  it("uses K-2 band for null grade", () => {
    const world = getQuestWorldBySlug("math-cosmos")!;
    const skills = getChapterSkills(world, 1, null);

    const bandK2Skills = world.gradeBands["K-2"].skills;
    for (const skill of skills) {
      expect(bandK2Skills).toContain(skill);
    }
  });

  it("returns different skills for different chapters", () => {
    const world = getQuestWorldBySlug("math-cosmos")!;
    const skills1 = getChapterSkills(world, 1, 4);
    const skills5 = getChapterSkills(world, 5, 4);

    // At least some skills should differ between ch1 and ch5
    const overlap = skills1.filter((s) => skills5.includes(s));
    expect(overlap.length).toBeLessThan(Math.max(skills1.length, skills5.length));
  });
});

describe("Quest Progression Logic", () => {
  it("chapter XP rewards increase for boss chapters", () => {
    for (const world of ALL_QUEST_WORLDS) {
      const bossChapters = world.chapters.filter((c) => c.hasBoss);
      const regularChapters = world.chapters.filter((c) => !c.hasBoss);

      const maxRegularXp = Math.max(...regularChapters.map((c) => c.xpReward));
      const minBossXp = Math.min(...bossChapters.map((c) => c.xpReward));

      expect(minBossXp).toBeGreaterThanOrEqual(maxRegularXp);
    }
  });

  it("totalXp equals sum of all chapter rewards", () => {
    for (const world of ALL_QUEST_WORLDS) {
      const sumXp = world.chapters.reduce((sum, c) => sum + c.xpReward, 0);
      expect(world.totalXp).toBe(sumXp);
    }
  });

  it("boss XP scales: ch3=100, ch6=150, ch9/10=225", () => {
    for (const world of ALL_QUEST_WORLDS) {
      expect(world.chapters[2].xpReward).toBe(100); // ch3
      expect(world.chapters[5].xpReward).toBe(150); // ch6
      expect(world.chapters[8].xpReward).toBe(225); // ch9
      expect(world.chapters[9].xpReward).toBe(225); // ch10
    }
  });
});
