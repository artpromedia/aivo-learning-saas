import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeatureFlagClient } from "../client.js";
import type { FlagDefinition } from "../types.js";

function createMockRedis(store: Record<string, string> = {}) {
  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    set: vi.fn(async () => "OK"),
    del: vi.fn(async () => 1),
  } as unknown as import("ioredis").Redis;
}

function makeFlagData(flag: FlagDefinition): string {
  return JSON.stringify(flag);
}

describe("FeatureFlagClient", () => {
  describe("isEnabled", () => {
    it("returns false when flag does not exist", async () => {
      const redis = createMockRedis();
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const result = await client.isEnabled("nonexistent-flag");
      expect(result).toBe(false);
    });

    it("returns true for enabled BOOLEAN flag with true default", async () => {
      const flag: FlagDefinition = {
        key: "my-flag",
        type: "BOOLEAN",
        defaultValue: true,
        enabled: true,
      };
      const redis = createMockRedis({
        "ff:my-flag": makeFlagData(flag),
      });
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const result = await client.isEnabled("my-flag");
      expect(result).toBe(true);
    });

    it("returns false for disabled flag", async () => {
      const flag: FlagDefinition = {
        key: "my-flag",
        type: "BOOLEAN",
        defaultValue: true,
        enabled: false,
      };
      const redis = createMockRedis({
        "ff:my-flag": makeFlagData(flag),
      });
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const result = await client.isEnabled("my-flag");
      expect(result).toBe(false);
    });

    it("uses tenant override when available", async () => {
      const flag: FlagDefinition = {
        key: "my-flag",
        type: "BOOLEAN",
        defaultValue: false,
        enabled: true,
      };
      const redis = createMockRedis({
        "ff:my-flag": makeFlagData(flag),
        "ff:my-flag:tenant-1": JSON.stringify(true),
      });
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const result = await client.isEnabled("my-flag", {
        tenantId: "tenant-1",
      });
      expect(result).toBe(true);
    });
  });

  describe("getValue", () => {
    it("returns the default value for a BOOLEAN flag", async () => {
      const flag: FlagDefinition = {
        key: "string-flag",
        type: "BOOLEAN",
        defaultValue: "hello-world",
        enabled: true,
      };
      const redis = createMockRedis({
        "ff:string-flag": makeFlagData(flag),
      });
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const result = await client.getValue<string>("string-flag");
      expect(result).toBe("hello-world");
    });

    it("returns tenant override value", async () => {
      const flag: FlagDefinition = {
        key: "config-flag",
        type: "BOOLEAN",
        defaultValue: { limit: 10 },
        enabled: true,
      };
      const redis = createMockRedis({
        "ff:config-flag": makeFlagData(flag),
        "ff:config-flag:t1": JSON.stringify({ limit: 50 }),
      });
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const result = await client.getValue<{ limit: number }>("config-flag", {
        tenantId: "t1",
      });
      expect(result).toEqual({ limit: 50 });
    });
  });

  describe("evaluateAll", () => {
    it("evaluates multiple flags at once", async () => {
      const flagA: FlagDefinition = {
        key: "flag-a",
        type: "BOOLEAN",
        defaultValue: true,
        enabled: true,
      };
      const flagB: FlagDefinition = {
        key: "flag-b",
        type: "BOOLEAN",
        defaultValue: false,
        enabled: true,
      };
      const redis = createMockRedis({
        "ff:flag-a": makeFlagData(flagA),
        "ff:flag-b": makeFlagData(flagB),
      });
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const results = await client.evaluateAll(["flag-a", "flag-b"]);
      expect(results).toEqual({
        "flag-a": true,
        "flag-b": false,
      });
    });

    it("returns false for missing flags", async () => {
      const redis = createMockRedis();
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      const results = await client.evaluateAll(["missing-1", "missing-2"]);
      expect(results).toEqual({
        "missing-1": false,
        "missing-2": false,
      });
    });
  });

  describe("NATS propagation", () => {
    it("starts and stops listening without errors when no nats provided", () => {
      const redis = createMockRedis();
      const client = new FeatureFlagClient({
        redis,
        serviceName: "test-svc",
      });

      expect(() => client.startListening()).not.toThrow();
      expect(() => client.stopListening()).not.toThrow();
    });

    it("subscribes to the correct NATS subject", () => {
      const redis = createMockRedis();
      const subscribeMock = vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: () => ({
          next: () => new Promise(() => {}),
        }),
        unsubscribe: vi.fn(),
      });
      const mockNats = {
        subscribe: subscribeMock,
      } as unknown as import("nats").NatsConnection;

      const client = new FeatureFlagClient({
        redis,
        nats: mockNats,
        serviceName: "test-svc",
      });

      client.startListening();
      expect(subscribeMock).toHaveBeenCalledWith(
        "aivo.featureflag.changed",
        { queue: "ff-listener-test-svc" },
      );
      client.stopListening();
    });
  });
});
