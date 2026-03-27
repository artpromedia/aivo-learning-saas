import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeepLinking } from "../lti/deep-linking.js";
import { LtiService } from "../services/lti.service.js";

// Mock @aivo/events
vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock config
vi.mock("../config.js", () => ({
  getConfig: vi.fn().mockReturnValue({
    APP_URL: "https://app.aivo.test",
    LTI_PRIVATE_KEY: "mock-private-key-pem",
    LTI_PUBLIC_KEY: "mock-public-key-pem",
    LTI_KID: "aivo-lti-key-1",
  }),
  loadConfig: vi.fn(),
}));

// Mock jose
vi.mock("jose", () => ({
  decodeJwt: vi.fn(),
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(),
  importPKCS8: vi.fn().mockResolvedValue("mock-private-key-object"),
  SignJWT: vi.fn(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuer: vi.fn().mockReturnThis(),
    setAudience: vi.fn().mockReturnThis(),
    setSubject: vi.fn().mockReturnThis(),
    setJti: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("mock-nanoid-value"),
}));

// Mock @aivo/db
vi.mock("@aivo/db", () => ({
  ltiPlatforms: "ltiPlatforms",
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => val),
}));

const TENANT_ID = "00000000-0000-4000-a000-000000000001";
const PLATFORM_ID = "https://canvas.example.edu";
const CLIENT_ID = "00000000-0000-4000-a000-000000000002";
const DEPLOYMENT_ID = "deploy-001";

const mockPlatform = {
  id: "00000000-0000-4000-a000-000000000004",
  tenantId: TENANT_ID,
  name: "Canvas LMS",
  platformId: PLATFORM_ID,
  clientId: CLIENT_ID,
  deploymentId: DEPLOYMENT_ID,
  authLoginUrl: "https://canvas.example.edu/api/lti/authorize",
  authTokenUrl: "https://canvas.example.edu/login/oauth2/token",
  jwksUrl: "https://canvas.example.edu/api/lti/security/jwks",
  enabled: true,
};

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "00000000-0000-4000-a000-000000000001" }]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{}]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    redis: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      setex: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
    },
    identityClient: {
      createUser: vi.fn().mockResolvedValue({ id: "00000000-0000-4000-a000-000000000010", email: "test@test.com" }),
      createLearner: vi.fn().mockResolvedValue({ id: "00000000-0000-4000-a000-000000000011" }),
      findUserByEmail: vi.fn().mockResolvedValue(null),
      sendInvitation: vi.fn().mockResolvedValue(undefined),
    },
    log: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
  } as any;
}

describe("LTI Deep Linking", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
  });

  describe("DeepLinking.buildResponse", () => {
    it("generates JWT with content items using jose", async () => {
      const jose = await import("jose");

      const deepLinking = new DeepLinking();
      const result = await deepLinking.buildResponse(
        { platformId: PLATFORM_ID, clientId: CLIENT_ID, deploymentId: DEPLOYMENT_ID },
        [
          { type: "ltiResourceLink", title: "Math Lesson 1", url: "https://app.aivo.test/courses/math/1" },
          { type: "ltiResourceLink", title: "Reading Lesson 2", url: "https://app.aivo.test/courses/reading/2", subject: "reading" },
        ],
        "deep-link-data-token",
      );

      // importPKCS8 called with the private key and RS256 algorithm
      expect(jose.importPKCS8).toHaveBeenCalledWith("mock-private-key-pem", "RS256");

      // SignJWT constructed with LTI deep linking claims
      expect(jose.SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingResponse",
          "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
          "https://purl.imsglobal.org/spec/lti-dl/claim/data": "deep-link-data-token",
          "https://purl.imsglobal.org/spec/lti/claim/deployment_id": DEPLOYMENT_ID,
          "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": expect.arrayContaining([
            expect.objectContaining({ type: "ltiResourceLink", title: "Math Lesson 1" }),
            expect.objectContaining({ type: "ltiResourceLink", title: "Reading Lesson 2" }),
          ]),
        }),
      );

      // Returns the signed JWT
      expect(result).toBe("mock-jwt-token");
    });

    it("throws when private key is not configured", async () => {
      const { getConfig } = await import("../config.js");
      (getConfig as any).mockReturnValue({
        APP_URL: "https://app.aivo.test",
        LTI_PRIVATE_KEY: "",
        LTI_KID: "aivo-lti-key-1",
      });

      const jose = await import("jose");
      (jose.importPKCS8 as any).mockResolvedValue(null);

      const deepLinking = new DeepLinking();
      await expect(
        deepLinking.buildResponse(
          { platformId: PLATFORM_ID, clientId: CLIENT_ID, deploymentId: DEPLOYMENT_ID },
          [{ type: "ltiResourceLink", title: "Test", url: "https://example.com" }],
          "data",
        ),
      ).rejects.toThrow("LTI private key not configured");
    });

    it("includes subject in custom field when provided", async () => {
      const jose = await import("jose");

      // Restore config for this test
      const { getConfig } = await import("../config.js");
      (getConfig as any).mockReturnValue({
        APP_URL: "https://app.aivo.test",
        LTI_PRIVATE_KEY: "mock-private-key-pem",
        LTI_PUBLIC_KEY: "mock-public-key-pem",
        LTI_KID: "aivo-lti-key-1",
      });
      (jose.importPKCS8 as any).mockResolvedValue("mock-key");

      const deepLinking = new DeepLinking();
      await deepLinking.buildResponse(
        { platformId: PLATFORM_ID, clientId: CLIENT_ID, deploymentId: null },
        [{ type: "ltiResourceLink", title: "Science", url: "https://app.aivo.test/science", subject: "science" }],
        "data",
      );

      expect(jose.SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": [
            expect.objectContaining({
              custom: { subject: "science" },
            }),
          ],
          "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "",
        }),
      );
    });
  });

  describe("LtiService.handleDeepLink", () => {
    it("resolves platform and calls deep linking to build response", async () => {
      // Platform lookup from Redis cache
      app.redis.get.mockResolvedValue(JSON.stringify(mockPlatform));

      const payload = {
        iss: PLATFORM_ID,
        aud: CLIENT_ID,
        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingRequest",
        "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings": {
          accept_types: ["ltiResourceLink"],
          accept_presentation_document_targets: ["iframe"],
          data: "platform-deep-link-data",
        },
      };

      const contentItems = [
        { type: "ltiResourceLink", title: "Algebra Basics", url: "https://app.aivo.test/courses/algebra" },
      ];

      const service = new LtiService(app);
      const result = await service.handleDeepLink(payload, TENANT_ID, contentItems);

      expect(result).toBe("mock-jwt-token");
    });

    it("throws when platform is not found for clientId", async () => {
      app.redis.get.mockResolvedValue(null);
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const payload = {
        iss: PLATFORM_ID,
        aud: "nonexistent-client-id",
        "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings": { data: "" },
      };

      const service = new LtiService(app);
      await expect(
        service.handleDeepLink(payload, TENANT_ID, []),
      ).rejects.toThrow("Unknown platform");
    });

    it("passes empty string for data when deep_linking_settings has no data", async () => {
      app.redis.get.mockResolvedValue(JSON.stringify(mockPlatform));

      const payload = {
        iss: PLATFORM_ID,
        aud: CLIENT_ID,
        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingRequest",
        "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings": {
          accept_types: ["ltiResourceLink"],
        },
      };

      const service = new LtiService(app);
      const result = await service.handleDeepLink(payload, TENANT_ID, []);
      expect(result).toBe("mock-jwt-token");
    });
  });
});
