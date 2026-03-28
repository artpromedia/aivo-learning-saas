import { describe, it, expect } from "vitest";
import { evaluateFlag } from "../evaluator.js";
import type { FlagDefinition, EvalContext } from "../types.js";

describe("evaluateFlag", () => {
  describe("kill switch (enabled === false)", () => {
    it("returns false for BOOLEAN flag when disabled", () => {
      const flag: FlagDefinition = {
        key: "test-flag",
        type: "BOOLEAN",
        defaultValue: true,
        enabled: false,
      };
      expect(evaluateFlag(flag)).toBe(false);
    });

    it("returns false for PERCENTAGE flag when disabled", () => {
      const flag: FlagDefinition = {
        key: "test-flag",
        type: "PERCENTAGE",
        defaultValue: 100,
        enabled: false,
      };
      expect(evaluateFlag(flag, { tenantId: "abc" })).toBe(false);
    });

    it("returns false for TENANT_LIST flag when disabled", () => {
      const flag: FlagDefinition = {
        key: "test-flag",
        type: "TENANT_LIST",
        defaultValue: ["tenant-1"],
        enabled: false,
      };
      expect(evaluateFlag(flag, { tenantId: "tenant-1" })).toBe(false);
    });
  });

  describe("BOOLEAN type", () => {
    it("returns true when enabled and defaultValue is true", () => {
      const flag: FlagDefinition = {
        key: "bool-flag",
        type: "BOOLEAN",
        defaultValue: true,
        enabled: true,
      };
      expect(evaluateFlag(flag)).toBe(true);
    });

    it("returns false when enabled and defaultValue is false", () => {
      const flag: FlagDefinition = {
        key: "bool-flag",
        type: "BOOLEAN",
        defaultValue: false,
        enabled: true,
      };
      expect(evaluateFlag(flag)).toBe(false);
    });
  });

  describe("PERCENTAGE type", () => {
    it("returns false when no tenantId is provided", () => {
      const flag: FlagDefinition = {
        key: "pct-flag",
        type: "PERCENTAGE",
        defaultValue: 50,
        enabled: true,
      };
      expect(evaluateFlag(flag)).toBe(false);
    });

    it("returns consistent results for the same tenant", () => {
      const flag: FlagDefinition = {
        key: "pct-flag",
        type: "PERCENTAGE",
        defaultValue: 50,
        enabled: true,
      };
      const context: EvalContext = { tenantId: "tenant-123" };
      const result1 = evaluateFlag(flag, context);
      const result2 = evaluateFlag(flag, context);
      expect(result1).toBe(result2);
    });

    it("includes all tenants at 100%", () => {
      const flag: FlagDefinition = {
        key: "pct-flag",
        type: "PERCENTAGE",
        defaultValue: 100,
        enabled: true,
      };
      const results = new Set<unknown>();
      for (let i = 0; i < 100; i++) {
        results.add(evaluateFlag(flag, { tenantId: `tenant-${i}` }));
      }
      expect(results.size).toBe(1);
      expect(results.has(true)).toBe(true);
    });

    it("excludes all tenants at 0%", () => {
      const flag: FlagDefinition = {
        key: "pct-flag",
        type: "PERCENTAGE",
        defaultValue: 0,
        enabled: true,
      };
      const results = new Set<unknown>();
      for (let i = 0; i < 100; i++) {
        results.add(evaluateFlag(flag, { tenantId: `tenant-${i}` }));
      }
      expect(results.size).toBe(1);
      expect(results.has(false)).toBe(true);
    });

    it("produces a reasonable distribution at 50%", () => {
      const flag: FlagDefinition = {
        key: "pct-flag",
        type: "PERCENTAGE",
        defaultValue: 50,
        enabled: true,
      };
      let trueCount = 0;
      const total = 1000;
      for (let i = 0; i < total; i++) {
        if (evaluateFlag(flag, { tenantId: `tenant-${i}` }) === true) {
          trueCount++;
        }
      }
      expect(trueCount).toBeGreaterThan(350);
      expect(trueCount).toBeLessThan(650);
    });
  });

  describe("TENANT_LIST type", () => {
    it("returns true when tenantId is in the list", () => {
      const flag: FlagDefinition = {
        key: "list-flag",
        type: "TENANT_LIST",
        defaultValue: ["tenant-a", "tenant-b"],
        enabled: true,
      };
      expect(evaluateFlag(flag, { tenantId: "tenant-a" })).toBe(true);
    });

    it("returns false when tenantId is not in the list", () => {
      const flag: FlagDefinition = {
        key: "list-flag",
        type: "TENANT_LIST",
        defaultValue: ["tenant-a", "tenant-b"],
        enabled: true,
      };
      expect(evaluateFlag(flag, { tenantId: "tenant-c" })).toBe(false);
    });

    it("returns false when no tenantId is provided", () => {
      const flag: FlagDefinition = {
        key: "list-flag",
        type: "TENANT_LIST",
        defaultValue: ["tenant-a"],
        enabled: true,
      };
      expect(evaluateFlag(flag)).toBe(false);
    });
  });

  describe("override precedence", () => {
    it("uses override value over default when provided", () => {
      const flag: FlagDefinition = {
        key: "bool-flag",
        type: "BOOLEAN",
        defaultValue: false,
        enabled: true,
      };
      expect(evaluateFlag(flag, undefined, true)).toBe(true);
    });

    it("uses override value for PERCENTAGE flag", () => {
      const flag: FlagDefinition = {
        key: "pct-flag",
        type: "PERCENTAGE",
        defaultValue: 0,
        enabled: true,
      };
      expect(evaluateFlag(flag, { tenantId: "tenant-1" }, true)).toBe(true);
    });

    it("kill switch overrides even when override value is provided", () => {
      const flag: FlagDefinition = {
        key: "bool-flag",
        type: "BOOLEAN",
        defaultValue: true,
        enabled: false,
      };
      expect(evaluateFlag(flag, undefined, true)).toBe(false);
    });
  });
});
