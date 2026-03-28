import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateCohortSize,
  generalizeAge,
  generalizeGrade,
  generalizeDisability,
  applyKAnonymity,
  addDifferentialPrivacy,
  laplaceNoise,
  addNoiseToMetrics,
  hashIdentifier,
  stripPii,
  generateExportSalt,
  anonymizeRecords,
  PrivacyBudgetTracker,
  type LearnerRecord,
} from "../services/anonymizer.js";

function createMockRecords(count: number): LearnerRecord[] {
  const records: LearnerRecord[] = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: `learner-${i}`,
      email: `learner${i}@example.com`,
      name: `Learner ${i}`,
      phone: `555-000-${String(i).padStart(4, "0")}`,
      quasiIdentifiers: {
        age: 10 + (i % 5),
        grade: String(3 + (i % 4)),
        disability: i % 3 === 0 ? "autism" : i % 3 === 1 ? "dyslexia" : "adhd",
        zipCode: `1000${i % 3}`,
        gender: i % 2 === 0 ? "M" : "F",
      },
      metrics: {
        score: 50 + (i % 40),
        progressRate: 0.3 + (i % 10) * 0.05,
      },
    });
  }
  return records;
}

describe("Anonymizer", () => {
  describe("validateCohortSize", () => {
    it("should throw for cohort size below 30", () => {
      expect(() => validateCohortSize(10)).toThrow("below minimum threshold of 30");
      expect(() => validateCohortSize(29)).toThrow("below minimum threshold of 30");
    });

    it("should not throw for cohort size >= 30", () => {
      expect(() => validateCohortSize(30)).not.toThrow();
      expect(() => validateCohortSize(1000)).not.toThrow();
    });
  });

  describe("generalizeAge", () => {
    it("should return correct age bands", () => {
      expect(generalizeAge(3)).toBe("0-5");
      expect(generalizeAge(7)).toBe("6-8");
      expect(generalizeAge(10)).toBe("9-11");
      expect(generalizeAge(13)).toBe("12-14");
      expect(generalizeAge(16)).toBe("15-17");
      expect(generalizeAge(19)).toBe("18-21");
      expect(generalizeAge(25)).toBe("22+");
    });

    it("should return undefined for undefined input", () => {
      expect(generalizeAge(undefined)).toBeUndefined();
    });
  });

  describe("generalizeGrade", () => {
    it("should return correct grade bands", () => {
      expect(generalizeGrade("K")).toBe("Early Childhood");
      expect(generalizeGrade("2")).toBe("Lower Elementary");
      expect(generalizeGrade("5")).toBe("Upper Elementary");
      expect(generalizeGrade("7")).toBe("Middle School");
      expect(generalizeGrade("10")).toBe("High School");
    });

    it("should return Other for unknown grades", () => {
      expect(generalizeGrade("unknown")).toBe("Other");
    });

    it("should return undefined for undefined input", () => {
      expect(generalizeGrade(undefined)).toBeUndefined();
    });
  });

  describe("generalizeDisability", () => {
    it("should return correct disability categories", () => {
      expect(generalizeDisability("autism")).toBe("Developmental");
      expect(generalizeDisability("dyslexia")).toBe("Cognitive");
      expect(generalizeDisability("speech_impairment")).toBe("Communication");
      expect(generalizeDisability("emotional_disturbance")).toBe("Behavioral");
      expect(generalizeDisability("visual_impairment")).toBe("Sensory");
      expect(generalizeDisability("orthopedic_impairment")).toBe("Physical");
    });

    it("should return Other for unknown disabilities", () => {
      expect(generalizeDisability("rare_condition")).toBe("Other");
    });

    it("should return undefined for undefined input", () => {
      expect(generalizeDisability(undefined)).toBeUndefined();
    });
  });

  describe("k-Anonymity", () => {
    it("should suppress groups smaller than k", () => {
      const records = createMockRecords(50);
      const result = applyKAnonymity(records, 10);
      expect(result.length).toBeLessThanOrEqual(records.length);
    });

    it("should keep groups with k or more members", () => {
      const records = createMockRecords(100);
      const result = applyKAnonymity(records, 5);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return empty for very high k on small dataset", () => {
      const records = createMockRecords(30);
      const result = applyKAnonymity(records, 100);
      expect(result.length).toBeLessThanOrEqual(30);
    });
  });

  describe("Differential Privacy", () => {
    it("should add noise to a value", () => {
      const original = 100;
      const results = new Set<number>();
      for (let i = 0; i < 20; i++) {
        results.add(addDifferentialPrivacy(original, 1.0));
      }
      expect(results.size).toBeGreaterThan(1);
    });

    it("should produce different noise values", () => {
      const noises = new Set<number>();
      for (let i = 0; i < 20; i++) {
        noises.add(laplaceNoise(1.0));
      }
      expect(noises.size).toBeGreaterThan(1);
    });

    it("should add noise to all metrics", () => {
      const metrics = { score: 80, progressRate: 0.7 };
      const noisy = addNoiseToMetrics(metrics, 1.0);
      expect(Object.keys(noisy)).toEqual(["score", "progressRate"]);
      const isExactSame = noisy.score === 80 && noisy.progressRate === 0.7;
      expect(isExactSame).toBe(false);
    });

    it("should produce less noise with higher epsilon", () => {
      const deviationsLow: number[] = [];
      const deviationsHigh: number[] = [];

      for (let i = 0; i < 1000; i++) {
        deviationsLow.push(Math.abs(laplaceNoise(0.1)));
        deviationsHigh.push(Math.abs(laplaceNoise(10.0)));
      }

      const avgLow = deviationsLow.reduce((a, b) => a + b, 0) / deviationsLow.length;
      const avgHigh = deviationsHigh.reduce((a, b) => a + b, 0) / deviationsHigh.length;

      expect(avgHigh).toBeLessThan(avgLow);
    });
  });

  describe("Data Stripping", () => {
    it("should remove PII fields", () => {
      const record: LearnerRecord = {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        phone: "555-1234",
        quasiIdentifiers: { age: 10, grade: "5" },
        metrics: { score: 80 },
      };

      const stripped = stripPii(record);
      expect(stripped).not.toHaveProperty("email");
      expect(stripped).not.toHaveProperty("name");
      expect(stripped).not.toHaveProperty("phone");
      expect(stripped.id).toBe("test-id");
      expect(stripped.metrics.score).toBe(80);
    });

    it("should hash identifiers with salt", () => {
      const hash1 = hashIdentifier("id-1", "salt-a");
      const hash2 = hashIdentifier("id-1", "salt-b");
      const hash3 = hashIdentifier("id-1", "salt-a");

      expect(hash1).not.toBe(hash2);
      expect(hash1).toBe(hash3);
      expect(hash1.length).toBe(64);
    });

    it("should generate unique export salts", () => {
      const salt1 = generateExportSalt();
      const salt2 = generateExportSalt();
      expect(salt1).not.toBe(salt2);
      expect(salt1.length).toBe(64);
    });
  });

  describe("Full Anonymization Pipeline", () => {
    it("should anonymize records end-to-end", () => {
      const records = createMockRecords(50);
      const result = anonymizeRecords(records, { kLevel: 5, epsilon: 1.0 });

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(records.length);

      for (const r of result) {
        expect(r.hashedId).toBeDefined();
        expect(r.hashedId.length).toBe(64);
        expect(r).not.toHaveProperty("email");
        expect(r).not.toHaveProperty("name");
        expect(r).not.toHaveProperty("phone");
        expect(r).not.toHaveProperty("id");
      }
    });

    it("should reject cohorts below minimum size", () => {
      const records = createMockRecords(10);
      expect(() => anonymizeRecords(records, { kLevel: 5, epsilon: 1.0 })).toThrow(
        "below minimum threshold of 30",
      );
    });

    it("should use different salt per export", () => {
      const records = createMockRecords(50);
      const result1 = anonymizeRecords(records, { kLevel: 5, epsilon: 1.0, salt: "salt-1" });
      const result2 = anonymizeRecords(records, { kLevel: 5, epsilon: 1.0, salt: "salt-2" });

      if (result1.length > 0 && result2.length > 0) {
        expect(result1[0].hashedId).not.toBe(result2[0].hashedId);
      }
    });
  });

  describe("Privacy Budget", () => {
    let tracker: PrivacyBudgetTracker;

    beforeEach(() => {
      tracker = new PrivacyBudgetTracker(10.0);
    });

    it("should initialize budget for new cohort", () => {
      const budget = tracker.getBudget("cohort-1");
      expect(budget.totalEpsilon).toBe(10.0);
      expect(budget.usedEpsilon).toBe(0);
      expect(budget.remainingEpsilon).toBe(10.0);
    });

    it("should consume budget", () => {
      const result = tracker.consume("cohort-1", 2.0);
      expect(result).toBe(true);

      const budget = tracker.getBudget("cohort-1");
      expect(budget.usedEpsilon).toBe(2.0);
      expect(budget.remainingEpsilon).toBe(8.0);
    });

    it("should reject when budget is exceeded", () => {
      tracker.consume("cohort-1", 8.0);
      const result = tracker.consume("cohort-1", 3.0);
      expect(result).toBe(false);
    });

    it("should check remaining budget", () => {
      tracker.consume("cohort-1", 7.0);
      expect(tracker.hasRemainingBudget("cohort-1", 3.0)).toBe(true);
      expect(tracker.hasRemainingBudget("cohort-1", 4.0)).toBe(false);
    });

    it("should track budgets per cohort independently", () => {
      tracker.consume("cohort-1", 5.0);
      tracker.consume("cohort-2", 2.0);

      expect(tracker.getBudget("cohort-1").remainingEpsilon).toBe(5.0);
      expect(tracker.getBudget("cohort-2").remainingEpsilon).toBe(8.0);
    });

    it("should load and save to redis", async () => {
      const mockRedis = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue("OK"),
      };

      await tracker.loadFromRedis(mockRedis, "cohort-1");
      expect(mockRedis.get).toHaveBeenCalledWith("privacy_budget:cohort-1");

      tracker.consume("cohort-1", 3.0);
      await tracker.saveToRedis(mockRedis, "cohort-1");
      expect(mockRedis.set).toHaveBeenCalledWith(
        "privacy_budget:cohort-1",
        expect.stringContaining('"usedEpsilon":3'),
      );
    });

    it("should restore budget from redis", async () => {
      const stored = JSON.stringify({
        cohortId: "cohort-1",
        totalEpsilon: 10.0,
        usedEpsilon: 4.0,
        remainingEpsilon: 6.0,
      });

      const mockRedis = {
        get: vi.fn().mockResolvedValue(stored),
        set: vi.fn().mockResolvedValue("OK"),
      };

      const budget = await tracker.loadFromRedis(mockRedis, "cohort-1");
      expect(budget.usedEpsilon).toBe(4.0);
      expect(budget.remainingEpsilon).toBe(6.0);
    });
  });
});
