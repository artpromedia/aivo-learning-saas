import { describe, it, expect } from "vitest";
import { BADGE_DEFINITIONS, getBadgeBySlug } from "../data/badge-definitions.js";

describe("Badge Definitions", () => {
  it("has at least 13 badge definitions", () => {
    expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(13);
  });

  it("each badge has a unique slug", () => {
    const slugs = BADGE_DEFINITIONS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(BADGE_DEFINITIONS.length);
  });

  it("each badge has required fields", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.slug).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.category).toBeTruthy();
      expect(badge.iconUrl).toBeTruthy();
      expect(badge.criteria).toBeDefined();
    }
  });

  describe("Required Badge Rules", () => {
    it("first_steps: complete first lesson", () => {
      const badge = getBadgeBySlug("first_steps")!;
      expect(badge.criteria).toEqual({ type: "first_lesson" });
    });

    it("brain_activated: brain clone", () => {
      const badge = getBadgeBySlug("brain_activated")!;
      expect(badge.criteria).toEqual({ type: "brain_cloned" });
    });

    it("week_warrior: 7-day streak", () => {
      const badge = getBadgeBySlug("week_warrior")!;
      expect(badge.criteria).toEqual({ type: "streak_days", days: 7 });
    });

    it("month_master: 30-day streak", () => {
      const badge = getBadgeBySlug("month_master")!;
      expect(badge.criteria).toEqual({ type: "streak_days", days: 30 });
    });

    it("perfect_score: 100% on any quiz", () => {
      const badge = getBadgeBySlug("perfect_score")!;
      expect(badge.criteria).toEqual({ type: "perfect_score", count: 1 });
    });

    it("math_whiz: master 10 math skills >= 0.8", () => {
      const badge = getBadgeBySlug("math_whiz")!;
      expect(badge.criteria).toEqual({
        type: "mastery_skills",
        subject: "math",
        count: 10,
        threshold: 0.8,
      });
    });

    it("bookworm: 20 reading sessions", () => {
      const badge = getBadgeBySlug("bookworm")!;
      expect(badge.criteria).toEqual({ type: "session_count", sessionType: "reading", count: 20 });
    });

    it("homework_hero: 10 homework sessions with quality >= 0.7", () => {
      const badge = getBadgeBySlug("homework_hero")!;
      expect(badge.criteria).toEqual({
        type: "session_count",
        sessionType: "homework",
        count: 10,
        minQuality: 0.7,
      });
    });

    it("quest_champion: complete any quest", () => {
      const badge = getBadgeBySlug("quest_champion")!;
      expect(badge.criteria).toEqual({ type: "quest_completed", count: 1 });
    });

    it("social_star: win 5 challenges", () => {
      const badge = getBadgeBySlug("social_star")!;
      expect(badge.criteria).toEqual({ type: "challenge_wins", count: 5 });
    });

    it("explorer: try all 5 subjects", () => {
      const badge = getBadgeBySlug("explorer")!;
      expect(badge.criteria).toEqual({ type: "subjects_tried", count: 5 });
    });

    it("helper: help 3 peers", () => {
      const badge = getBadgeBySlug("helper")!;
      expect(badge.criteria).toEqual({ type: "peer_helps", count: 3 });
    });

    it("iep_achiever: meet any IEP goal", () => {
      const badge = getBadgeBySlug("iep_achiever")!;
      expect(badge.criteria).toEqual({ type: "iep_goal_met", count: 1 });
    });
  });

  it("getBadgeBySlug returns undefined for unknown slug", () => {
    expect(getBadgeBySlug("nonexistent")).toBeUndefined();
  });
});
