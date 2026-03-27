import { describe, it, expect, vi, beforeEach } from "vitest";
import { OidcHandler } from "../lti/oidc-handler.js";
import { MessageValidator } from "../lti/message-validator.js";
import { LtiService } from "../services/lti.service.js";

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("mock-nanoid-state-value-32chars00"),
}));

// Mock @aivo/events
vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock config
vi.mock("../config.js", () => ({
  getConfig: vi.fn().mockReturnValue({
    APP_URL: "https://app.aivo.test",
    LTI_PRIVATE_KEY: "mock-private-key",
    LTI_PUBLIC_KEY: "mock-public-key",
    LTI_KID: "aivo-lti-key-1",
  }),
  loadConfig: vi.fn(),
}));

// Mock jose
vi.mock("jose", () => ({
  decodeJwt: vi.fn(),
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(),
  importPKCS8: vi.fn(),
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
const LEARNER_ID = "00000000-0000-4000-a000-000000000003";

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

describe("LTI Launch Flow", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
  });

  describe("OidcHandler.initiateLogin", () => {
    it("generates state, stores in Redis, returns auth URL with proper params", async () => {
      // Set up platform lookup: getByClientId goes redis -> db
      app.redis.get.mockResolvedValue(null);
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPlatform]),
          }),
        }),
      });

      const handler = new OidcHandler(app);
      const result = await handler.initiateLogin({
        iss: PLATFORM_ID,
        login_hint: "user-hint-123",
        target_link_uri: "https://app.aivo.test/launch",
        client_id: CLIENT_ID,
        lti_message_hint: "message-hint-456",
      });

      // State was stored in Redis with 600s TTL
      expect(app.redis.setex).toHaveBeenCalledWith(
        expect.stringContaining("lti:state:"),
        600,
        expect.any(String),
      );

      // setex is called twice: first by PlatformRegistry to cache the platform,
      // then by OidcHandler to store the state. Find the state call.
      const stateCall = app.redis.setex.mock.calls.find(
        (call: any[]) => typeof call[2] === "string" && call[0].startsWith("lti:state:"),
      );
      expect(stateCall).toBeDefined();
      const storedPayload = JSON.parse(stateCall![2]);
      expect(storedPayload).toEqual(
        expect.objectContaining({
          platformId: PLATFORM_ID,
          clientId: CLIENT_ID,
          nonce: expect.any(String),
        }),
      );

      // Result is a valid URL with required OIDC params
      const url = new URL(result);
      expect(url.origin).toBe("https://canvas.example.edu");
      expect(url.searchParams.get("scope")).toBe("openid");
      expect(url.searchParams.get("response_type")).toBe("id_token");
      expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
      expect(url.searchParams.get("redirect_uri")).toBe("https://app.aivo.test/integrations/lti/launch");
      expect(url.searchParams.get("login_hint")).toBe("user-hint-123");
      expect(url.searchParams.get("state")).toBeTruthy();
      expect(url.searchParams.get("nonce")).toBeTruthy();
      expect(url.searchParams.get("response_mode")).toBe("form_post");
      expect(url.searchParams.get("prompt")).toBe("none");
      expect(url.searchParams.get("lti_message_hint")).toBe("message-hint-456");
    });

    it("throws when platform is not found", async () => {
      app.redis.get.mockResolvedValue(null);
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const handler = new OidcHandler(app);
      await expect(
        handler.initiateLogin({
          iss: "https://unknown.platform.edu",
          login_hint: "user-hint",
          target_link_uri: "https://app.aivo.test/launch",
          client_id: "nonexistent-client-id",
        }),
      ).rejects.toThrow("Unknown LTI platform");
    });

    it("looks up platform by iss when client_id is not provided", async () => {
      // Without client_id, getByPlatformId is used which goes straight to DB
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPlatform]),
          }),
        }),
      });

      const handler = new OidcHandler(app);
      const result = await handler.initiateLogin({
        iss: PLATFORM_ID,
        login_hint: "user-hint-123",
        target_link_uri: "https://app.aivo.test/launch",
      });

      expect(result).toContain("canvas.example.edu");
    });
  });

  describe("MessageValidator.validate", () => {
    it("validates an LTI id_token with jose", async () => {
      const jose = await import("jose");

      const mockPayload = {
        iss: PLATFORM_ID,
        aud: CLIENT_ID,
        nonce: "test-nonce-123",
        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
        "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
      };

      (jose.decodeJwt as any).mockReturnValue({ aud: CLIENT_ID, iss: PLATFORM_ID });
      (jose.createRemoteJWKSet as any).mockReturnValue("mock-jwks-fn");
      (jose.jwtVerify as any).mockResolvedValue({ payload: mockPayload });

      // Platform lookup via Redis cache (first get), nonce check (second get returns null)
      app.redis.get
        .mockResolvedValueOnce(JSON.stringify(mockPlatform));
      // Default mock returns null for nonce check

      const validator = new MessageValidator(app);
      const result = await validator.validate("mock-id-token");

      expect(jose.decodeJwt).toHaveBeenCalledWith("mock-id-token");
      expect(jose.createRemoteJWKSet).toHaveBeenCalled();
      expect(jose.jwtVerify).toHaveBeenCalledWith("mock-id-token", "mock-jwks-fn", {
        issuer: PLATFORM_ID,
        audience: CLIENT_ID,
      });

      expect(result).toEqual({
        payload: mockPayload,
        platformId: PLATFORM_ID,
        clientId: CLIENT_ID,
        tenantId: TENANT_ID,
      });

      // Nonce stored in Redis to prevent replay
      expect(app.redis.setex).toHaveBeenCalledWith("lti:nonce:test-nonce-123", 3600, "1");
    });

    it("throws on missing audience claim", async () => {
      const jose = await import("jose");
      (jose.decodeJwt as any).mockReturnValue({ iss: PLATFORM_ID });

      const validator = new MessageValidator(app);
      await expect(validator.validate("bad-token")).rejects.toThrow("Missing audience claim");
    });

    it("throws on unknown platform", async () => {
      const jose = await import("jose");
      (jose.decodeJwt as any).mockReturnValue({ aud: "unknown-client", iss: PLATFORM_ID });

      // No cache, no DB result
      app.redis.get.mockResolvedValue(null);
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const validator = new MessageValidator(app);
      await expect(validator.validate("unknown-token")).rejects.toThrow("Unknown LTI platform");
    });

    it("throws on unsupported LTI version", async () => {
      const jose = await import("jose");
      (jose.decodeJwt as any).mockReturnValue({ aud: CLIENT_ID });
      (jose.createRemoteJWKSet as any).mockReturnValue("mock-jwks-fn");
      (jose.jwtVerify as any).mockResolvedValue({
        payload: {
          "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
          "https://purl.imsglobal.org/spec/lti/claim/version": "1.0.0",
        },
      });

      app.redis.get.mockResolvedValue(JSON.stringify(mockPlatform));

      const validator = new MessageValidator(app);
      await expect(validator.validate("old-version-token")).rejects.toThrow("Unsupported LTI version");
    });

    it("rejects replayed nonce", async () => {
      const jose = await import("jose");
      (jose.decodeJwt as any).mockReturnValue({ aud: CLIENT_ID });
      (jose.createRemoteJWKSet as any).mockReturnValue("mock-jwks-fn");
      (jose.jwtVerify as any).mockResolvedValue({
        payload: {
          nonce: "replayed-nonce",
          "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
          "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
        },
      });

      app.redis.get
        .mockResolvedValueOnce(JSON.stringify(mockPlatform)) // platform cache
        .mockResolvedValueOnce("1"); // nonce already used

      const validator = new MessageValidator(app);
      await expect(validator.validate("replayed-token")).rejects.toThrow("Nonce already used");
    });
  });

  describe("LtiService.handleLaunch", () => {
    it("extracts user claims, finds existing user, publishes event", async () => {
      const { publishEvent } = await import("@aivo/events");

      const existingUser = { id: LEARNER_ID, email: "student@school.edu" };
      app.identityClient.findUserByEmail.mockResolvedValue(existingUser);

      const payload = {
        iss: PLATFORM_ID,
        aud: CLIENT_ID,
        email: "student@school.edu",
        name: "Jane Student",
        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
        "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
          id: "resource-link-001",
          title: "Math Assignment",
        },
        "https://purl.imsglobal.org/spec/lti/claim/custom": {
          subject: "math",
        },
      };

      const service = new LtiService(app);
      const result = await service.handleLaunch(payload, TENANT_ID);

      // Looked up existing user by email
      expect(app.identityClient.findUserByEmail).toHaveBeenCalledWith("student@school.edu");

      // Published launch event
      expect(publishEvent).toHaveBeenCalledWith(app.nats, "integrations.lti.launch", {
        tenantId: TENANT_ID,
        learnerId: LEARNER_ID,
        platformId: PLATFORM_ID,
        resourceLinkId: "resource-link-001",
        subject: "math",
      });

      // Returns structured launch data
      expect(result).toEqual({
        messageType: "LtiResourceLinkRequest",
        user: { email: "student@school.edu", name: "Jane Student", learnerId: LEARNER_ID },
        resourceLink: { id: "resource-link-001", title: "Math Assignment" },
        custom: { subject: "math" },
        tenantId: TENANT_ID,
      });
    });

    it("does not publish event when user is not found", async () => {
      const { publishEvent } = await import("@aivo/events");

      app.identityClient.findUserByEmail.mockResolvedValue(null);

      const payload = {
        iss: PLATFORM_ID,
        email: "unknown@school.edu",
        name: "Unknown User",
        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
        "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
          id: "resource-link-002",
        },
      };

      const service = new LtiService(app);
      const result = await service.handleLaunch(payload, TENANT_ID);

      expect(result.user.learnerId).toBeUndefined();
      expect(publishEvent).not.toHaveBeenCalled();
    });

    it("does not publish event when no resource link is present", async () => {
      const { publishEvent } = await import("@aivo/events");

      app.identityClient.findUserByEmail.mockResolvedValue({ id: LEARNER_ID });

      const payload = {
        iss: PLATFORM_ID,
        email: "student@school.edu",
        name: "Jane Student",
        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
      };

      const service = new LtiService(app);
      await service.handleLaunch(payload, TENANT_ID);

      expect(publishEvent).not.toHaveBeenCalled();
    });
  });
});
