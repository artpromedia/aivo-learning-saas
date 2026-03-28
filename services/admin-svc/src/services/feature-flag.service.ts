import type { FastifyInstance } from "fastify";
import { featureFlags, featureFlagOverrides } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { StringCodec } from "nats";
import { evaluateFlag } from "@aivo/feature-flags";
import type { EvalContext, FlagDefinition } from "@aivo/feature-flags";
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
const NATS_SUBJECT = "aivo.featureflag.changed";
const sc = StringCodec();

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

    await this.syncFlagToRedis(flag.key, input.defaultValue, input.enabled, input.type);

    await this.publishFlagChanged({
      key: flag.key,
      type: input.type,
      enabled: input.enabled,
      defaultValue: input.defaultValue,
      changedBy: adminUserId,
    });

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

    await this.syncFlagToRedis(flag.key, flag.defaultValue, flag.enabled, flag.type);

    await this.publishFlagChanged({
      key: flag.key,
      type: flag.type as "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST",
      enabled: flag.enabled,
      defaultValue: flag.defaultValue,
      changedBy: adminUserId,
    });

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

  async delete(flagId: string, adminUserId: string, ipAddress?: string) {
    const [flag] = await this.app.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, flagId))
      .limit(1);

    if (!flag) {
      throw Object.assign(new Error("Feature flag not found"), { statusCode: 404 });
    }

    await this.app.db
      .delete(featureFlagOverrides)
      .where(eq(featureFlagOverrides.flagId, flagId));

    await this.app.db
      .delete(featureFlags)
      .where(eq(featureFlags.id, flagId));

    await this.app.redis.del(`${REDIS_FLAG_PREFIX}${flag.key}`);

    await this.publishFlagChanged({
      key: flag.key,
      type: flag.type as "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST",
      enabled: false,
      defaultValue: false,
      changedBy: adminUserId,
    });

    await this.auditService.log({
      adminUserId,
      action: "feature_flag.deleted",
      resourceType: "feature_flag",
      resourceId: flagId,
      details: { key: flag.key },
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

    await this.publishFlagChanged({
      key: flag.key,
      type: flag.type as "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST",
      enabled: flag.enabled,
      defaultValue: flag.defaultValue,
      overrideTenantId: input.tenantId,
      changedBy: adminUserId,
    });

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

  async removeTenantOverride(flagId: string, tenantId: string, adminUserId: string, ipAddress?: string) {
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
          eq(featureFlagOverrides.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      throw Object.assign(new Error("Tenant override not found"), { statusCode: 404 });
    }

    await this.app.db
      .delete(featureFlagOverrides)
      .where(eq(featureFlagOverrides.id, existing[0].id));

    await this.app.redis.del(`${REDIS_FLAG_PREFIX}${flag.key}:${tenantId}`);

    await this.publishFlagChanged({
      key: flag.key,
      type: flag.type as "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST",
      enabled: flag.enabled,
      defaultValue: flag.defaultValue,
      overrideTenantId: tenantId,
      changedBy: adminUserId,
    });

    await this.auditService.log({
      adminUserId,
      action: "feature_flag.tenant_override_removed",
      resourceType: "feature_flag_override",
      resourceId: flagId,
      details: { tenantId },
      ipAddress,
    });
  }

  async evaluate(key: string, context?: EvalContext): Promise<unknown> {
    const [flag] = await this.app.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);

    if (!flag) return false;

    const flagDef: FlagDefinition = {
      key: flag.key,
      type: flag.type as "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST",
      defaultValue: flag.defaultValue,
      enabled: flag.enabled,
    };

    let overrideValue: unknown | undefined;
    if (context?.tenantId) {
      const override = await this.app.db
        .select()
        .from(featureFlagOverrides)
        .where(
          and(
            eq(featureFlagOverrides.flagId, flag.id),
            eq(featureFlagOverrides.tenantId, context.tenantId),
          ),
        )
        .limit(1);

      if (override.length > 0) {
        overrideValue = override[0].value;
      }
    }

    return evaluateFlag(flagDef, context, overrideValue);
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

  private async syncFlagToRedis(key: string, value: unknown, enabled: boolean, type?: string) {
    const flagData = JSON.stringify({
      key,
      type: type ?? "BOOLEAN",
      defaultValue: value,
      enabled,
    });

    if (enabled) {
      await this.app.redis.set(`${REDIS_FLAG_PREFIX}${key}`, flagData);
    } else {
      await this.app.redis.del(`${REDIS_FLAG_PREFIX}${key}`);
    }
  }

  private async publishFlagChanged(payload: {
    key: string;
    type: "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST";
    enabled: boolean;
    defaultValue: unknown;
    overrideTenantId?: string;
    changedBy: string;
  }) {
    try {
      const event = {
        ...payload,
        changedAt: new Date().toISOString(),
      };
      const js = this.app.nats.jetstream();
      await js.publish(NATS_SUBJECT, sc.encode(JSON.stringify(event)));
    } catch {
      this.app.log.warn(`Failed to publish feature flag change event for ${payload.key}`);
    }
  }
}
