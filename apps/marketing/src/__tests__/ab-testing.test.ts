import { describe, it, expect, beforeEach } from "vitest";

describe("A/B Testing", () => {
  beforeEach(() => {
    (globalThis as any).window = {};
    (globalThis as any).sessionStorage = {
      _store: {} as Record<string, string>,
      getItem(key: string) { return this._store[key] ?? null; },
      setItem(key: string, val: string) { this._store[key] = val; },
    };
    (globalThis as any).crypto = {
      randomUUID: () => "test-uuid-12345",
    };
  });

  it("should return consistent variant for same visitor", async () => {
    const { getVariant } = await import("../lib/ab-testing");
    const v1 = getVariant("test-experiment", ["A", "B"]);
    const v2 = getVariant("test-experiment", ["A", "B"]);
    expect(v1).toBe(v2);
  });

  it("should handle single variant", async () => {
    const { getVariant } = await import("../lib/ab-testing");
    const v = getVariant("single", ["only"]);
    expect(v).toBe("only");
  });

  it("should handle empty variants", async () => {
    const { getVariant } = await import("../lib/ab-testing");
    const v = getVariant("empty", []);
    expect(v).toBe("");
  });
});
