import { describe, it, expect, vi } from "vitest";
import { DunningService } from "../services/dunning.service.js";

const UUID = "a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4";

describe("DunningService", () => {
  it("should track retry count in Redis", async () => {
    const app = {
      stripe: null,
      redis: {
        incr: vi.fn().mockResolvedValue(1),
        expire: vi.fn().mockResolvedValue(true),
      },
      nats: {
        jetstream: vi.fn().mockReturnValue({
          publish: vi.fn().mockResolvedValue(undefined),
        }),
      },
      log: { info: vi.fn(), error: vi.fn() },
    } as any;

    const service = new DunningService(app);
    const retryAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await service.handlePaymentFailure(UUID, "inv-1", retryAt);
    expect(app.redis.incr).toHaveBeenCalled();
  });

  it("should suspend subscriptions past due >14 days", async () => {
    const oldDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const app = {
      stripe: null,
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: UUID, tenantId: UUID, status: "PAST_DUE", updatedAt: oldDate },
            ]),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      },
      nats: {
        jetstream: vi.fn().mockReturnValue({
          publish: vi.fn().mockResolvedValue(undefined),
        }),
      },
      log: { info: vi.fn(), error: vi.fn() },
    } as any;

    const service = new DunningService(app);
    const count = await service.checkAndSuspend();
    expect(count).toBe(1);
    expect(app.db.update).toHaveBeenCalled();
  });
});
