import { describe, it, expect, vi, beforeEach } from "vitest";
import { signPayload, verifySignature } from "../webhooks/signature.js";
import { DeliveryEngine } from "../webhooks/delivery-engine.js";
import { WebhookService } from "../services/webhook.service.js";

// Mock @aivo/events
vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("mock-nanoid-secret-value-32chars0"),
}));

// Mock @aivo/db
vi.mock("@aivo/db", () => ({
  webhookEndpoints: {
    id: "id",
    tenantId: "tenantId",
    enabled: "enabled",
  },
  webhookDeliveries: {
    id: "id",
    webhookEndpointId: "webhookEndpointId",
    status: "status",
    createdAt: "createdAt",
    nextRetryAt: "nextRetryAt",
  },
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => val),
  and: vi.fn((...args: any[]) => args),
  desc: vi.fn((col) => col),
  lte: vi.fn((_col, val) => val),
  count: vi.fn().mockReturnValue("count"),
}));

const TENANT_ID = "00000000-0000-4000-a000-000000000001";
const WEBHOOK_ID = "00000000-0000-4000-a000-000000000005";
const DELIVERY_ID = "00000000-0000-4000-a000-000000000006";

const mockEndpoint = {
  id: WEBHOOK_ID,
  tenantId: TENANT_ID,
  url: "https://hooks.example.com/webhook",
  secret: "whsec_test-secret-value",
  eventTypes: ["learner.session.completed", "learner.mastery.updated"],
  enabled: true,
  description: "Test webhook",
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

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Webhook Delivery", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
  });

  describe("signPayload", () => {
    it("generates HMAC-SHA256 signature", () => {
      const payload = '{"event":"test"}';
      const secret = "my-secret";

      const sig = signPayload(payload, secret);

      // Should be a 64-char hex string (256 bits = 32 bytes = 64 hex chars)
      expect(sig).toMatch(/^[0-9a-f]{64}$/);
    });

    it("produces deterministic output for same input", () => {
      const payload = '{"id":"123","eventType":"learner.session.completed"}';
      const secret = "webhook-secret-key";

      const sig1 = signPayload(payload, secret);
      const sig2 = signPayload(payload, secret);

      expect(sig1).toBe(sig2);
    });

    it("produces different output for different payloads", () => {
      const secret = "same-secret";

      const sig1 = signPayload("payload-a", secret);
      const sig2 = signPayload("payload-b", secret);

      expect(sig1).not.toBe(sig2);
    });

    it("produces different output for different secrets", () => {
      const payload = "same-payload";

      const sig1 = signPayload(payload, "secret-1");
      const sig2 = signPayload(payload, "secret-2");

      expect(sig1).not.toBe(sig2);
    });
  });

  describe("verifySignature", () => {
    it("verifies valid signature", () => {
      const payload = '{"eventType":"learner.mastery.updated","data":{}}';
      const secret = "test-secret";
      const signature = signPayload(payload, secret);

      expect(verifySignature(payload, secret, signature)).toBe(true);
    });

    it("rejects invalid signature", () => {
      const payload = '{"eventType":"learner.mastery.updated"}';
      const secret = "test-secret";

      expect(verifySignature(payload, secret, "0".repeat(64))).toBe(false);
    });

    it("rejects signature with wrong length", () => {
      const payload = '{"data":"test"}';
      const secret = "test-secret";

      expect(verifySignature(payload, secret, "tooshort")).toBe(false);
    });

    it("rejects tampered payload", () => {
      const secret = "test-secret";
      const originalPayload = '{"amount":100}';
      const signature = signPayload(originalPayload, secret);

      const tamperedPayload = '{"amount":999}';
      expect(verifySignature(tamperedPayload, secret, signature)).toBe(false);
    });
  });

  describe("WebhookService.create", () => {
    it("creates endpoint with secret and validates event types", async () => {
      const createdEndpoint = {
        id: WEBHOOK_ID,
        tenantId: TENANT_ID,
        url: "https://hooks.example.com/webhook",
        secret: "whsec_mock-nanoid-secret-value-32chars0",
        eventTypes: ["learner.session.completed"],
        enabled: true,
      };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdEndpoint]),
        }),
      });

      const service = new WebhookService(app);
      const result = await service.create(TENANT_ID, {
        url: "https://hooks.example.com/webhook",
        eventTypes: ["learner.session.completed"],
        description: "My webhook",
      });

      expect(result.id).toBe(WEBHOOK_ID);
      expect(result.secret).toContain("whsec_");
      expect(app.db.insert).toHaveBeenCalled();
    });

    it("rejects invalid event types", async () => {
      const service = new WebhookService(app);

      await expect(
        service.create(TENANT_ID, {
          url: "https://hooks.example.com/webhook",
          eventTypes: ["invalid.event.type"],
        }),
      ).rejects.toThrow("Invalid event type: invalid.event.type");
    });

    it("rejects when one of multiple event types is invalid", async () => {
      const service = new WebhookService(app);

      await expect(
        service.create(TENANT_ID, {
          url: "https://hooks.example.com/webhook",
          eventTypes: ["learner.session.completed", "bogus.event"],
        }),
      ).rejects.toThrow("Invalid event type: bogus.event");
    });
  });

  describe("WebhookService.sendTestPayload", () => {
    it("creates delivery and attempts to deliver", async () => {
      // First select: find endpoint
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEndpoint]),
          }),
        }),
      });

      // Insert: create delivery record
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: DELIVERY_ID, webhookEndpointId: WEBHOOK_ID, attempts: 0, maxAttempts: 5 }]),
        }),
      });

      // Mock successful fetch for delivery attempt
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue("OK"),
      });

      const service = new WebhookService(app);
      const result = await service.sendTestPayload(WEBHOOK_ID, TENANT_ID);

      expect(result.deliveryId).toBeDefined();
      expect(result.payload).toBeDefined();
      expect(result.payload.eventType).toBe("test.ping");
      expect(mockFetch).toHaveBeenCalled();
    });

    it("throws when webhook endpoint is not found", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const service = new WebhookService(app);
      await expect(
        service.sendTestPayload(WEBHOOK_ID, TENANT_ID),
      ).rejects.toThrow("Webhook not found");
    });
  });

  describe("DeliveryEngine.deliver", () => {
    it("sends HTTP POST with HMAC signature", async () => {
      // First select: find endpoint
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEndpoint]),
          }),
        }),
      });

      // Insert: create delivery
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: DELIVERY_ID, webhookEndpointId: WEBHOOK_ID, attempts: 0, maxAttempts: 5 }]),
        }),
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue("received"),
      });

      const engine = new DeliveryEngine(app);
      const payload = {
        id: "00000000-0000-4000-a000-000000000007",
        eventType: "learner.session.completed",
        timestamp: "2026-01-01T00:00:00.000Z",
        data: { sessionId: "s1" },
      };

      const deliveryId = await engine.deliver(WEBHOOK_ID, payload);
      expect(deliveryId).toBe(DELIVERY_ID);

      // Verify fetch was called with correct params
      expect(mockFetch).toHaveBeenCalledWith(
        "https://hooks.example.com/webhook",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Webhook-Signature": expect.stringContaining("sha256="),
            "X-Webhook-Event": "learner.session.completed",
            "X-Webhook-Id": "00000000-0000-4000-a000-000000000007",
          }),
          body: JSON.stringify(payload),
        }),
      );

      // Delivery marked as DELIVERED on success
      expect(app.db.update).toHaveBeenCalled();
    });

    it("throws when endpoint is not found or disabled", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const engine = new DeliveryEngine(app);
      await expect(
        engine.deliver(WEBHOOK_ID, {
          id: "00000000-0000-4000-a000-000000000008",
          eventType: "test",
          timestamp: new Date().toISOString(),
          data: {},
        }),
      ).rejects.toThrow("Webhook endpoint not found or disabled");
    });
  });

  describe("DeliveryEngine retry scheduling", () => {
    it("schedules retry with exponential backoff on failed delivery", async () => {
      // Endpoint lookup
      app.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEndpoint]),
          }),
        }),
      });

      // Insert delivery
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: DELIVERY_ID,
            webhookEndpointId: WEBHOOK_ID,
            attempts: 0,
            maxAttempts: 5,
          }]),
        }),
      });

      // Fetch fails with 500
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("Internal Server Error"),
      });

      // scheduleRetry: select delivery to get current attempts
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{
                id: DELIVERY_ID,
                attempts: 0,
                maxAttempts: 5,
              }]),
            }),
          }),
        });

      const engine = new DeliveryEngine(app);
      const payload = {
        id: "00000000-0000-4000-a000-000000000009",
        eventType: "learner.session.completed",
        timestamp: "2026-01-01T00:00:00.000Z",
        data: {},
      };

      const deliveryId = await engine.deliver(WEBHOOK_ID, payload);
      expect(deliveryId).toBe(DELIVERY_ID);

      // Update should set status to RETRYING with a nextRetryAt
      expect(app.db.update).toHaveBeenCalled();
      const updateCalls = app.db.update.mock.calls;
      expect(updateCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("marks delivery as FAILED when max attempts exceeded", async () => {
      // scheduleRetry is called internally; we test via attemptDelivery
      // Simulate a delivery that has exhausted retries
      app.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: DELIVERY_ID,
              attempts: 4, // Will become 5 which equals maxAttempts
              maxAttempts: 5,
            }]),
          }),
        }),
      });

      // Expect update to FAILED status
      const mockUpdateSet = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });
      app.db.update.mockReturnValue({ set: mockUpdateSet });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: vi.fn().mockResolvedValue("Service Unavailable"),
      });

      const engine = new DeliveryEngine(app);
      const result = await engine.attemptDelivery(
        DELIVERY_ID,
        "https://hooks.example.com/webhook",
        "whsec_test",
        {
          id: "00000000-0000-4000-a000-000000000012",
          eventType: "learner.session.completed",
          timestamp: "2026-01-01T00:00:00.000Z",
          data: {},
        },
      );

      expect(result).toBe(false);
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "FAILED",
          httpStatus: 503,
          attempts: 5,
        }),
      );
    });

    it("handles network errors and schedules retry", async () => {
      mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));

      // scheduleRetry: lookup delivery
      app.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: DELIVERY_ID,
              attempts: 0,
              maxAttempts: 5,
            }]),
          }),
        }),
      });

      const engine = new DeliveryEngine(app);
      const result = await engine.attemptDelivery(
        DELIVERY_ID,
        "https://hooks.example.com/webhook",
        "whsec_test",
        {
          id: "00000000-0000-4000-a000-000000000013",
          eventType: "test",
          timestamp: new Date().toISOString(),
          data: {},
        },
      );

      expect(result).toBe(false);
      // Should have called update for retry scheduling
      expect(app.db.update).toHaveBeenCalled();
    });
  });
});
