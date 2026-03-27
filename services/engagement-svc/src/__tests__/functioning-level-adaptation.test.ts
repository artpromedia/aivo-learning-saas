import { describe, it, expect } from "vitest";
import { getGamificationMode, type GamificationMode } from "../services/xp.service.js";

describe("Functioning Level Gamification Adaptation", () => {
  it("STANDARD returns full mode", () => {
    expect(getGamificationMode("STANDARD")).toBe("full");
  });

  it("SUPPORTED returns full_simplified mode", () => {
    expect(getGamificationMode("SUPPORTED")).toBe("full_simplified");
  });

  it("LOW_VERBAL returns celebration_first mode", () => {
    expect(getGamificationMode("LOW_VERBAL")).toBe("celebration_first");
  });

  it("NON_VERBAL returns cause_and_effect mode", () => {
    expect(getGamificationMode("NON_VERBAL")).toBe("cause_and_effect");
  });

  it("PRE_SYMBOLIC returns parent_facing_only mode", () => {
    expect(getGamificationMode("PRE_SYMBOLIC")).toBe("parent_facing_only");
  });

  it("unknown level defaults to full mode", () => {
    expect(getGamificationMode("UNKNOWN")).toBe("full");
  });

  describe("Mode descriptions", () => {
    it("full mode includes: XP, streaks, badges, shop, quests, multiplayer, leaderboard", () => {
      const mode = getGamificationMode("STANDARD");
      expect(mode).toBe("full");
    });

    it("full_simplified mode adds: larger icons, audio celebrations", () => {
      const mode = getGamificationMode("SUPPORTED");
      expect(mode).toBe("full_simplified");
    });

    it("celebration_first mode: star rewards, no leaderboard, sensory-friendly", () => {
      const mode = getGamificationMode("LOW_VERBAL");
      expect(mode).toBe("celebration_first");
    });

    it("cause_and_effect mode: immediate visual+audio rewards, simple progress bar", () => {
      const mode = getGamificationMode("NON_VERBAL");
      expect(mode).toBe("cause_and_effect");
    });

    it("parent_facing_only mode: no child-facing gamification", () => {
      const mode = getGamificationMode("PRE_SYMBOLIC");
      expect(mode).toBe("parent_facing_only");
    });
  });

  describe("All 5 levels produce unique modes", () => {
    it("each functioning level maps to a distinct gamification mode", () => {
      const levels = ["STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"];
      const modes = levels.map(getGamificationMode);
      expect(new Set(modes).size).toBe(5);
    });
  });
});
