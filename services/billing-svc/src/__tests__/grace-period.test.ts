import { describe, it, expect, vi } from "vitest";
import { GracePeriodService } from "../services/grace-period.service.js";

describe("GracePeriodService", () => {
  it("should expire subscriptions past grace period", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const app = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: "sub-1", tenantId: "tenant-1", gracePeriodEndsAt: pastDate },
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

    const service = new GracePeriodService(app);
    const count = await service.checkAndExpireSubscriptions();
    expect(count).toBe(1);
    expect(app.db.update).toHaveBeenCalled();
  });

  it("should expire tutor addons past grace period", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const app = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: "addon-1", learnerId: "learner-1", tenantId: "tenant-1", sku: "ADDON_TUTOR_MATH", gracePeriodEndsAt: pastDate },
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

    const service = new GracePeriodService(app);
    const count = await service.checkAndExpireAddons();
    expect(count).toBe(1);
  });

  it("should return 0 when no expired subscriptions", async () => {
    const app = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      },
      log: { info: vi.fn() },
    } as any;

    const service = new GracePeriodService(app);
    const count = await service.checkAndExpireSubscriptions();
    expect(count).toBe(0);
  });
});
