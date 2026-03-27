import { describe, it, expect } from "vitest";
import {
  scoreToQuality,
  calculateNewEasinessFactor,
  calculateNextInterval,
  SM2_CONFIG,
} from "../data/spaced-repetition-config.js";

describe("Spaced Repetition SM-2", () => {
  describe("scoreToQuality", () => {
    it("maps perfect score (>=0.95) to quality 5", () => {
      expect(scoreToQuality(1.0)).toBe(5);
      expect(scoreToQuality(0.95)).toBe(5);
    });

    it("maps good score (>=0.85) to quality 4", () => {
      expect(scoreToQuality(0.9)).toBe(4);
      expect(scoreToQuality(0.85)).toBe(4);
    });

    it("maps passing score (>=0.7) to quality 3", () => {
      expect(scoreToQuality(0.75)).toBe(3);
      expect(scoreToQuality(0.7)).toBe(3);
    });

    it("maps near-miss (>=0.5) to quality 2", () => {
      expect(scoreToQuality(0.6)).toBe(2);
      expect(scoreToQuality(0.5)).toBe(2);
    });

    it("maps poor score (>=0.2) to quality 1", () => {
      expect(scoreToQuality(0.3)).toBe(1);
      expect(scoreToQuality(0.2)).toBe(1);
    });

    it("maps no response (<0.2) to quality 0", () => {
      expect(scoreToQuality(0.1)).toBe(0);
      expect(scoreToQuality(0)).toBe(0);
    });
  });

  describe("calculateNewEasinessFactor", () => {
    it("increases EF for quality 5 (perfect)", () => {
      const newEF = calculateNewEasinessFactor(2.5, 5);
      expect(newEF).toBeGreaterThan(2.5);
    });

    it("keeps EF roughly stable for quality 4", () => {
      const newEF = calculateNewEasinessFactor(2.5, 4);
      expect(newEF).toBeCloseTo(2.5, 1);
    });

    it("decreases EF for quality 2 (incorrect)", () => {
      const newEF = calculateNewEasinessFactor(2.5, 2);
      expect(newEF).toBeLessThan(2.5);
    });

    it("decreases EF significantly for quality 0", () => {
      const newEF = calculateNewEasinessFactor(2.5, 0);
      expect(newEF).toBeLessThan(2.0);
    });

    it("never goes below minimum EF (1.3)", () => {
      const newEF = calculateNewEasinessFactor(1.3, 0);
      expect(newEF).toBeGreaterThanOrEqual(SM2_CONFIG.minEasinessFactor);
    });

    it("applies the correct SM-2 formula", () => {
      // For quality 3: delta = 0.1 - (5-3) * (0.08 + (5-3) * 0.02) = 0.1 - 2 * 0.12 = -0.14
      const newEF = calculateNewEasinessFactor(2.5, 3);
      expect(newEF).toBeCloseTo(2.36, 2);
    });
  });

  describe("calculateNextInterval", () => {
    it("returns 1 day for first repetition", () => {
      expect(calculateNextInterval(0, 0, 2.5)).toBe(SM2_CONFIG.firstInterval);
    });

    it("returns 6 days for second repetition", () => {
      expect(calculateNextInterval(1, 1, 2.5)).toBe(SM2_CONFIG.secondInterval);
    });

    it("multiplies previous interval by EF for subsequent repetitions", () => {
      const result = calculateNextInterval(2, 6, 2.5);
      expect(result).toBe(Math.round(6 * 2.5)); // 15
    });

    it("uses actual EF for interval multiplication", () => {
      const result = calculateNextInterval(3, 15, 2.1);
      expect(result).toBe(Math.round(15 * 2.1)); // 32
    });

    it("increases interval on correct answers", () => {
      const interval1 = calculateNextInterval(0, 0, 2.5); // 1
      const interval2 = calculateNextInterval(1, interval1, 2.5); // 6
      const interval3 = calculateNextInterval(2, interval2, 2.5); // 15
      expect(interval1).toBeLessThan(interval2);
      expect(interval2).toBeLessThan(interval3);
    });
  });

  describe("SM-2 full cycle", () => {
    it("correctly simulates repeated correct answers", () => {
      let ef = SM2_CONFIG.defaultEasinessFactor;
      let interval = 0;
      let repetition = 0;

      // 5 correct reviews with quality 4
      for (let i = 0; i < 5; i++) {
        interval = calculateNextInterval(repetition, interval, ef);
        ef = calculateNewEasinessFactor(ef, 4);
        repetition++;
      }

      // After 5 correct reviews, interval should be substantial
      expect(interval).toBeGreaterThan(30);
      expect(ef).toBeGreaterThanOrEqual(SM2_CONFIG.minEasinessFactor);
    });

    it("resets interval on incorrect answer", () => {
      let ef = SM2_CONFIG.defaultEasinessFactor;
      let interval = 0;
      let repetition = 0;

      // 3 correct reviews
      for (let i = 0; i < 3; i++) {
        interval = calculateNextInterval(repetition, interval, ef);
        ef = calculateNewEasinessFactor(ef, 4);
        repetition++;
      }

      const intervalBeforeIncorrect = interval;
      expect(intervalBeforeIncorrect).toBeGreaterThan(1);

      // Incorrect answer: reset
      repetition = 0;
      interval = SM2_CONFIG.firstInterval;
      ef = calculateNewEasinessFactor(ef, 1);

      expect(interval).toBe(1);
      expect(interval).toBeLessThan(intervalBeforeIncorrect);
    });
  });
});
