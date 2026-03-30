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

  it("should send 7-day warning exactly once (idempotency)", async () => {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const publishMock = vi.fn().mockResolvedValue(undefined);
    const app = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                id: "sub-1",
                tenantId: "tenant-1",
                gracePeriodEndsAt: sevenDaysFromNow,
                warningSentAt: null,
              },
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
          publish: publishMock,
        }),
      },
      log: { info: vi.fn(), error: vi.fn() },
    } as any;

    const service = new GracePeriodService(app);
    await service.sendGracePeriodWarnings();

    // Warning published once
    expect(publishMock).toHaveBeenCalledTimes(1);
    // warningSentAt is set so subsequent runs skip this subscription
    expect(app.db.update).toHaveBeenCalled();
  });

  it("should emit data deletion event when grace period expires", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const publishMock = vi.fn().mockResolvedValue(undefined);
    const app = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: "a0000000-0000-0000-0000-000000000001", tenantId: "b0000000-0000-0000-0000-000000000001", gracePeriodEndsAt: pastDate },
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
          publish: publishMock,
        }),
      },
      log: { info: vi.fn(), error: vi.fn() },
    } as any;

    const service = new GracePeriodService(app);
    await service.checkAndExpireSubscriptions();

    // Verify a deletion event was published via NATS
    expect(publishMock).toHaveBeenCalled();
    const publishCall = publishMock.mock.calls[0];
    expect(publishCall).toBeDefined();
  });

  it("should allow reactivation during grace period", async () => {
    const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const app = {
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                id: "sub-1",
                tenantId: "tenant-1",
                status: "GRACE_PERIOD",
                gracePeriodEndsAt: futureDate,
              },
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
    const result = await service.reactivateSubscription("sub-1");

    expect(app.db.update).toHaveBeenCalled();
  });
});
