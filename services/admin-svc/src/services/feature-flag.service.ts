import type { FastifyInstance } from "fastify";
import { featureFlags, featureFlagOverrides } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { AuditService } from "./audit.service.js";

export interface CreateFlagInput {
  key: string;
  description?: string;
  type: "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST";
  defaultValue: unknown;
  enabled: boolean;
}

export interface UpdateFlagInput {
  description?: string;
  defaultValue?: unknown;
  enabled?: boolean;
}

export interface TenantOverrideInput {
  tenantId: string;
  value: unknown;
}

const REDIS_FLAG_PREFIX = "ff:";

export class FeatureFlagService {
  private auditService: AuditService;

  constructor(private readonly app: FastifyInstance) {
    this.auditService = new AuditService(app);
  }

  async list() {
    const flags = await this.app.db
      .select()
      .from(featureFlags);

    const overrides = await this.app.db
      .select()
      .from(featureFlagOverrides);

    return flags.map((flag) => ({
      ...flag,
      overrides: overrides.filter((o) => o.flagId === flag.id),
    }));
  }

  async create(input: CreateFlagInput, adminUserId: string, ipAddress?: string) {
    const [flag] = await this.app.db
      .insert(featureFlags)
      .values({
        key: input.key,
        description: input.description,
        type: input.type,
        defaultValue: input.defaultValue,
        enabled: input.enabled,
        createdBy: adminUserId,
      })
      .returning();

    await this.syncFlagToRedis(flag.key, input.defaultValue, input.enabled);

    await this.auditService.log({
      adminUserId,
      action: "feature_flag.created",
      resourceType: "feature_flag",
      resourceId: flag.id,
      details: { key: input.key, type: input.type },
      ipAddress,
    });

    return flag;
  }

  async update(flagId: string, input: UpdateFlagInput, adminUserId: string, ipAddress?: string) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.description !== undefined) updateData.description = input.description;
    if (input.defaultValue !== undefined) updateData.defaultValue = input.defaultValue;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;

    const [flag] = await this.app.db
      .update(featureFlags)
      .set(updateData)
      .where(eq(featureFlags.id, flagId))
      .returning();

    if (!flag) {
      throw Object.assign(new Error("Feature flag not found"), { statusCode: 404 });
    }

    await this.syncFlagToRedis(flag.key, flag.defaultValue, flag.enabled);

    await this.auditService.log({
      adminUserId,
      action: "feature_flag.updated",
      resourceType: "feature_flag",
      resourceId: flagId,
      details: input as Record<string, unknown>,
      ipAddress,
    });

    return flag;
  }

  async setTenantOverride(flagId: string, input: TenantOverrideInput, adminUserId: string, ipAddress?: string) {
    const [flag] = await this.app.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, flagId))
      .limit(1);

    if (!flag) {
      throw Object.assign(new Error("Feature flag not found"), { statusCode: 404 });
    }

    const existing = await this.app.db
      .select()
      .from(featureFlagOverrides)
      .where(
        and(
          eq(featureFlagOverrides.flagId, flagId),
          eq(featureFlagOverrides.tenantId, input.tenantId),
        ),
      )
      .limit(1);

    let override;
    if (existing.length > 0) {
      [override] = await this.app.db
        .update(featureFlagOverrides)
        .set({ value: input.value, updatedAt: new Date() })
        .where(eq(featureFlagOverrides.id, existing[0].id))
        .returning();
    } else {
      [override] = await this.app.db
        .insert(featureFlagOverrides)
        .values({
          flagId,
          tenantId: input.tenantId,
          value: input.value,
        })
        .returning();
    }

    await this.app.redis.set(
      `${REDIS_FLAG_PREFIX}${flag.key}:${input.tenantId}`,
      JSON.stringify(input.value),
    );

    await this.auditService.log({
      adminUserId,
      action: "feature_flag.tenant_override",
      resourceType: "feature_flag_override",
      resourceId: flagId,
      details: { tenantId: input.tenantId, value: input.value },
      ipAddress,
    });

    return override;
  }

  async getFlagValue(key: string, tenantId?: string): Promise<unknown> {
    if (tenantId) {
      const tenantOverride = await this.app.redis.get(`${REDIS_FLAG_PREFIX}${key}:${tenantId}`);
      if (tenantOverride !== null) {
        return JSON.parse(tenantOverride);
      }
    }

    const globalValue = await this.app.redis.get(`${REDIS_FLAG_PREFIX}${key}`);
    if (globalValue !== null) {
      return JSON.parse(globalValue);
    }

    const [flag] = await this.app.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);

    if (!flag || !flag.enabled) return false;

    await this.syncFlagToRedis(flag.key, flag.defaultValue, flag.enabled);
    return flag.defaultValue;
  }

  private async syncFlagToRedis(key: string, value: unknown, enabled: boolean) {
    if (enabled) {
      await this.app.redis.set(`${REDIS_FLAG_PREFIX}${key}`, JSON.stringify(value));
    } else {
      await this.app.redis.del(`${REDIS_FLAG_PREFIX}${key}`);
    }
  }
}
