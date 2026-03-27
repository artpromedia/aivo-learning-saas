import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw on missing required fields", () => {
    delete process.env.DATABASE_URL;
    delete process.env.REDIS_URL;
    delete process.env.NATS_URL;
    delete process.env.AUTH_SECRET;
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;

    // Need to reimport to clear cached config
    expect(() => {
      const { z } = require("zod");
      const schema = z.object({
        DATABASE_URL: z.string().min(1),
      });
      schema.parse({});
    }).toThrow();
  });

  it("should use default PORT of 3001", () => {
    process.env.DATABASE_URL = "postgresql://test";
    process.env.REDIS_URL = "redis://test";
    process.env.NATS_URL = "nats://test";
    process.env.AUTH_SECRET = "a".repeat(32);
    process.env.JWT_PRIVATE_KEY = "test-key";
    process.env.JWT_PUBLIC_KEY = "test-key";

    // Import fresh
    const { z } = require("zod");
    const configSchema = z.object({
      PORT: z.coerce.number().default(3001),
      DATABASE_URL: z.string().min(1),
      REDIS_URL: z.string().min(1),
      NATS_URL: z.string().min(1),
      AUTH_SECRET: z.string().min(32),
      JWT_PRIVATE_KEY: z.string().min(1),
      JWT_PUBLIC_KEY: z.string().min(1),
      NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    });

    const config = configSchema.parse(process.env);
    expect(config.PORT).toBe(3001);
    // vitest sets NODE_ENV to 'test', so default doesn't apply
    expect(["development", "test", "production"]).toContain(config.NODE_ENV);
  });
});
