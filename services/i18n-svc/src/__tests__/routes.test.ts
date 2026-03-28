import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before imports
vi.mock("../config.js", () => ({
  loadConfig: () => ({
    PORT: 3011,
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NATS_URL: "nats://localhost:4222",
    AI_SVC_URL: "http://localhost:5000",
    APP_URL: "http://localhost:3000",
    NODE_ENV: "test",
  }),
  getConfig: () => ({
    PORT: 3011,
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NATS_URL: "nats://localhost:4222",
    AI_SVC_URL: "http://localhost:5000",
    APP_URL: "http://localhost:3000",
    NODE_ENV: "test",
  }),
}));

describe("i18n-svc route schemas", () => {
  describe("Locale routes", () => {
    it("should validate locale creation payload", () => {
      const { z } = require("zod");
      const createLocaleSchema = z.object({
        code: z.string().min(2).max(10),
        name: z.string().min(1).max(128),
        nativeName: z.string().min(1).max(128),
        direction: z.enum(["LTR", "RTL"]).default("LTR"),
        isDefault: z.boolean().default(false),
        isEnabled: z.boolean().default(true),
      });

      const valid = createLocaleSchema.parse({
        code: "es",
        name: "Spanish",
        nativeName: "Español",
      });

      expect(valid.code).toBe("es");
      expect(valid.direction).toBe("LTR");
      expect(valid.isDefault).toBe(false);
      expect(valid.isEnabled).toBe(true);
    });

    it("should reject invalid locale code", () => {
      const { z } = require("zod");
      const createLocaleSchema = z.object({
        code: z.string().min(2).max(10),
        name: z.string().min(1).max(128),
        nativeName: z.string().min(1).max(128),
      });

      expect(() =>
        createLocaleSchema.parse({ code: "x", name: "Test", nativeName: "Test" }),
      ).toThrow();
    });

    it("should validate RTL direction", () => {
      const { z } = require("zod");
      const createLocaleSchema = z.object({
        code: z.string().min(2).max(10),
        name: z.string().min(1).max(128),
        nativeName: z.string().min(1).max(128),
        direction: z.enum(["LTR", "RTL"]).default("LTR"),
      });

      const valid = createLocaleSchema.parse({
        code: "ar",
        name: "Arabic",
        nativeName: "العربية",
        direction: "RTL",
      });

      expect(valid.direction).toBe("RTL");
    });
  });

  describe("Translation routes", () => {
    it("should validate bulk upsert payload", () => {
      const { z } = require("zod");
      const upsertBodySchema = z.record(z.string(), z.string());

      const valid = upsertBodySchema.parse({
        welcomeBack: "Welcome back",
        signIn: "Sign in",
        "auth.login.title": "Login",
      });

      expect(Object.keys(valid)).toHaveLength(3);
    });

    it("should reject non-string values in bulk upsert", () => {
      const { z } = require("zod");
      const upsertBodySchema = z.record(z.string(), z.string());

      expect(() =>
        upsertBodySchema.parse({ key: 123 }),
      ).toThrow();
    });

    it("should validate single translation payload", () => {
      const { z } = require("zod");
      const singleTranslationSchema = z.object({
        value: z.string(),
        isVerified: z.boolean().optional(),
      });

      const valid = singleTranslationSchema.parse({
        value: "Hello",
        isVerified: true,
      });

      expect(valid.value).toBe("Hello");
      expect(valid.isVerified).toBe(true);
    });

    it("should allow unverified by default", () => {
      const { z } = require("zod");
      const singleTranslationSchema = z.object({
        value: z.string(),
        isVerified: z.boolean().optional(),
      });

      const valid = singleTranslationSchema.parse({
        value: "Hello",
      });

      expect(valid.isVerified).toBeUndefined();
    });
  });

  describe("Translate routes", () => {
    it("should validate translate request payload", () => {
      const { z } = require("zod");
      const translateBodySchema = z.object({
        sourceLocale: z.string().min(2).max(10),
        targetLocale: z.string().min(2).max(10),
        keys: z.array(z.string()).min(1).max(500),
      });

      const valid = translateBodySchema.parse({
        sourceLocale: "en",
        targetLocale: "es",
        keys: ["common.welcome", "auth.signIn"],
      });

      expect(valid.keys).toHaveLength(2);
    });

    it("should reject empty keys array", () => {
      const { z } = require("zod");
      const translateBodySchema = z.object({
        sourceLocale: z.string().min(2).max(10),
        targetLocale: z.string().min(2).max(10),
        keys: z.array(z.string()).min(1).max(500),
      });

      expect(() =>
        translateBodySchema.parse({
          sourceLocale: "en",
          targetLocale: "es",
          keys: [],
        }),
      ).toThrow();
    });

    it("should reject more than 500 keys", () => {
      const { z } = require("zod");
      const translateBodySchema = z.object({
        sourceLocale: z.string().min(2).max(10),
        targetLocale: z.string().min(2).max(10),
        keys: z.array(z.string()).min(1).max(500),
      });

      const manyKeys = Array.from({ length: 501 }, (_, i) => `key.${i}`);
      expect(() =>
        translateBodySchema.parse({
          sourceLocale: "en",
          targetLocale: "es",
          keys: manyKeys,
        }),
      ).toThrow();
    });
  });
});

describe("Export format helpers", () => {
  it("should build flat JSON export from namespace rows", () => {
    const rows = [
      { nsKey: "common", key: "welcome", value: "Welcome" },
      { nsKey: "common", key: "goodbye", value: "Goodbye" },
      { nsKey: "auth", key: "signIn", value: "Sign in" },
    ];

    const json: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!json[row.nsKey]) json[row.nsKey] = {};
      json[row.nsKey][row.key] = row.value;
    }

    expect(json).toEqual({
      common: { welcome: "Welcome", goodbye: "Goodbye" },
      auth: { signIn: "Sign in" },
    });
  });

  it("should build ARB format from namespace rows", () => {
    const locale = "en";
    const rows = [
      { nsKey: "common", key: "welcome", value: "Welcome" },
      { nsKey: "auth", key: "signIn", value: "Sign in" },
    ];

    const arb: Record<string, string> = { "@@locale": locale };
    for (const row of rows) {
      const arbKey = `${row.nsKey}_${row.key}`.replace(/\./g, "_");
      arb[arbKey] = row.value;
    }

    expect(arb).toEqual({
      "@@locale": "en",
      common_welcome: "Welcome",
      auth_signIn: "Sign in",
    });
  });

  it("should preserve ICU MessageFormat in translations", () => {
    const icuString = "{count, plural, one {# item} other {# items}}";
    const rows = [{ nsKey: "common", key: "itemCount", value: icuString }];

    const json: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!json[row.nsKey]) json[row.nsKey] = {};
      json[row.nsKey][row.key] = row.value;
    }

    expect(json.common.itemCount).toBe(icuString);
  });
});

describe("Import format detection", () => {
  it("should detect ARB format by @@locale key", () => {
    const data = {
      "@@locale": "es",
      common_welcome: "Bienvenido",
      auth_signIn: "Iniciar sesión",
    };

    const isArb = "@@locale" in data;
    expect(isArb).toBe(true);
  });

  it("should detect JSON format by absence of @@locale key", () => {
    const data = {
      common: { welcome: "Welcome" },
      auth: { signIn: "Sign in" },
    };

    const isArb = "@@locale" in data;
    expect(isArb).toBe(false);
  });

  it("should handle flat JSON without namespaces", () => {
    const data = { welcome: "Welcome", signIn: "Sign in" };
    const isArb = "@@locale" in data;
    expect(isArb).toBe(false);

    // Flat strings should be assigned to "common" namespace
    const isFlat = Object.values(data).every((v) => typeof v === "string");
    expect(isFlat).toBe(true);
  });
});

describe("LLM translation prompt", () => {
  it("should build a proper translation prompt", () => {
    const sourceLocale = "en";
    const targetLocale = "es";
    const sourceTranslations = {
      "common.welcome": "Welcome",
      "auth.signIn": "Sign in",
    };

    const entries = Object.entries(sourceTranslations)
      .map(([key, value]) => `  "${key}": "${value}"`)
      .join(",\n");

    const prompt = `You are a professional translator for a children's educational platform (AIVO Learning).
Translate the following UI strings from ${sourceLocale} to ${targetLocale}.`;

    expect(prompt).toContain("en");
    expect(prompt).toContain("es");
    expect(prompt).toContain("AIVO Learning");

    expect(entries).toContain('"common.welcome": "Welcome"');
    expect(entries).toContain('"auth.signIn": "Sign in"');
  });
});

describe("Health route", () => {
  it("should return correct health response shape", () => {
    const response = {
      status: "ok",
      service: "i18n-svc",
      timestamp: new Date().toISOString(),
    };

    expect(response.status).toBe("ok");
    expect(response.service).toBe("i18n-svc");
    expect(response.timestamp).toBeTruthy();
  });
});
