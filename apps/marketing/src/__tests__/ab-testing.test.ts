import { describe, it, expect, beforeEach } from "vitest";

type MockStorage = {
  _store: Record<string, string>;
  getItem: (key: string) => string | null;
  setItem: (key: string, val: string) => void;
};

type TestGlobals = typeof globalThis & {
  window: Record<string, unknown>;
  sessionStorage: MockStorage;
  crypto: { randomUUID: () => string };
};

describe("A/B Testing", () => {
  beforeEach(() => {
    const g = globalThis as TestGlobals;
    g.window = {};
    g.sessionStorage = {
      _store: {} as Record<string, string>,
      getItem(key: string) { return this._store[key] ?? null; },
      setItem(key: string, val: string) { this._store[key] = val; },
    };
    g.crypto = {
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
