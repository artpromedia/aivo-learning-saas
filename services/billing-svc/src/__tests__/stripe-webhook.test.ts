import { describe, it, expect, vi } from "vitest";
import { WebhookService } from "../services/webhook.service.js";

const UUID = "a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4";

function createMockApp() {
  // Resolves as an array (destructurable) for .select().from().where()
  const selectResult = [{ id: UUID, tenantId: UUID, status: "ACTIVE", stripeSubscriptionId: "sub_123" }];
  return {
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: UUID }]),
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(selectResult),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    stripe: null,
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    redis: {
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(true),
    },
    log: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
  } as any;
}

describe("WebhookService", () => {
  it("should dispatch checkout.session.completed events", async () => {
    const app = createMockApp();
    const service = new WebhookService(app);

    // The handleCheckoutCompleted delegates to SubscriptionService
    // which hits DB and publishEvent — we just verify it doesn't throw
    await service.handleEvent({
      type: "checkout.session.completed",
      id: "evt_123",
      data: {
        object: {
          metadata: { tenantId: UUID, planId: "FAMILY" },
          subscription: "sub_stripe_123",
        },
      },
    } as any);

    expect(app.log.info).toHaveBeenCalled();
  });

  it("should dispatch invoice.paid events", async () => {
    const app = createMockApp();
    const service = new WebhookService(app);

    await service.handleEvent({
      type: "invoice.paid",
      id: "evt_456",
      data: {
        object: {
          subscription: "sub_stripe_123",
          amount_paid: 1999,
          id: "inv_123",
        },
      },
    } as any);

    expect(app.db.update).toHaveBeenCalled();
  });

  it("should log unknown event types", async () => {
    const app = createMockApp();
    const service = new WebhookService(app);

    await service.handleEvent({
      type: "unknown.event",
      id: "evt_789",
      data: { object: {} },
    } as any);

    expect(app.log.info).toHaveBeenCalledWith("Unhandled Stripe event type: unknown.event");
  });
});
