import type { FastifyInstance } from "fastify";
import { tenants, tenantConfigs, users } from "@aivo/db";
import { eq, ilike, and, type SQL, desc, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { publishEvent } from "@aivo/events";
import { AuditService } from "./audit.service.js";

export interface CreateTenantInput {
  name: string;
  type: "B2C_FAMILY" | "B2B_DISTRICT";
  planId?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateTenantInput {
  name?: string;
  planId?: string;
  settings?: Record<string, unknown>;
}

export interface TenantConfigInput {
  dailyLlmTokenQuota?: number;
  maxLearners?: number;
  allowedProviders?: string[];
  featuresEnabled?: Record<string, boolean>;
  subscriptionPlan?: string;
}

export interface TenantListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: "B2C_FAMILY" | "B2B_DISTRICT";
  status?: "ACTIVE" | "SUSPENDED" | "CANCELLED";
}

export class TenantService {
  private auditService: AuditService;

  constructor(private readonly app: FastifyInstance) {
    this.auditService = new AuditService(app);
  }

  async list(query: TenantListQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 25, 100);
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (query.search) {
      conditions.push(ilike(tenants.name, `%${query.search}%`));
    }
    if (query.type) {
      conditions.push(eq(tenants.type, query.type));
    }
    if (query.status) {
      conditions.push(eq(tenants.status, query.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.app.db
        .select()
        .from(tenants)
        .where(whereClause)
        .orderBy(desc(tenants.createdAt))
        .limit(limit)
        .offset(offset),
      this.app.db
        .select({ total: count() })
        .from(tenants)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(tenantId: string) {
    const [tenant] = await this.app.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw Object.assign(new Error("Tenant not found"), { statusCode: 404 });
    }

    const [config] = await this.app.db
      .select()
      .from(tenantConfigs)
      .where(eq(tenantConfigs.tenantId, tenantId))
      .limit(1);

    return { ...tenant, config: config ?? null };
  }

  async create(input: CreateTenantInput, adminUserId: string, ipAddress?: string) {
    const slug = `${input.type === "B2B_DISTRICT" ? "district" : "family"}-${nanoid(10)}`;

    const [tenant] = await this.app.db
      .insert(tenants)
      .values({
        name: input.name,
        slug,
        type: input.type,
        status: "ACTIVE",
        planId: input.planId,
        settings: input.settings ?? {},
      })
      .returning();

    await this.app.db.insert(tenantConfigs).values({
      tenantId: tenant.id,
      dailyLlmTokenQuota: input.type === "B2B_DISTRICT" ? 500000 : 50000,
      features: {},
    });

    await this.auditService.log({
      adminUserId,
      action: "tenant.created",
      resourceType: "tenant",
      resourceId: tenant.id,
      details: { name: input.name, type: input.type },
      ipAddress,
    });

    await publishEvent(this.app.nats, "admin.tenant.created", {
      tenantId: tenant.id,
      name: input.name,
      type: input.type,
      createdBy: adminUserId,
    });

    return tenant;
  }

  async update(tenantId: string, input: UpdateTenantInput, adminUserId: string, ipAddress?: string) {
    const [tenant] = await this.app.db
      .update(tenants)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!tenant) {
      throw Object.assign(new Error("Tenant not found"), { statusCode: 404 });
    }

    await this.auditService.log({
      adminUserId,
      action: "tenant.updated",
      resourceType: "tenant",
      resourceId: tenantId,
      details: input,
      ipAddress,
    });

    return tenant;
  }

  async suspend(tenantId: string, adminUserId: string, reason?: string, ipAddress?: string) {
    const [tenant] = await this.app.db
      .update(tenants)
      .set({ status: "SUSPENDED", updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!tenant) {
      throw Object.assign(new Error("Tenant not found"), { statusCode: 404 });
    }

    await this.app.db
      .update(users)
      .set({ status: "SUSPENDED", updatedAt: new Date() })
      .where(eq(users.tenantId, tenantId));

    await this.auditService.log({
      adminUserId,
      action: "tenant.suspended",
      resourceType: "tenant",
      resourceId: tenantId,
      details: { reason },
      ipAddress,
    });

    await publishEvent(this.app.nats, "admin.tenant.suspended", {
      tenantId,
      suspendedBy: adminUserId,
      reason,
    });

    return tenant;
  }

  async reactivate(tenantId: string, adminUserId: string, ipAddress?: string) {
    const [tenant] = await this.app.db
      .update(tenants)
      .set({ status: "ACTIVE", updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!tenant) {
      throw Object.assign(new Error("Tenant not found"), { statusCode: 404 });
    }

    await this.app.db
      .update(users)
      .set({ status: "ACTIVE", updatedAt: new Date() })
      .where(and(eq(users.tenantId, tenantId), eq(users.status, "SUSPENDED")));

    await this.auditService.log({
      adminUserId,
      action: "tenant.reactivated",
      resourceType: "tenant",
      resourceId: tenantId,
      ipAddress,
    });

    return tenant;
  }

  async getConfig(tenantId: string) {
    const [config] = await this.app.db
      .select()
      .from(tenantConfigs)
      .where(eq(tenantConfigs.tenantId, tenantId))
      .limit(1);

    if (!config) {
      throw Object.assign(new Error("Tenant config not found"), { statusCode: 404 });
    }

    return config;
  }

  async updateConfig(tenantId: string, input: TenantConfigInput, adminUserId: string, ipAddress?: string) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.dailyLlmTokenQuota !== undefined) {
      updateData.dailyLlmTokenQuota = input.dailyLlmTokenQuota;
    }
    if (input.allowedProviders !== undefined) {
      updateData.llmProviderOverride = input.allowedProviders.join(",");
    }
    if (input.featuresEnabled !== undefined) {
      updateData.features = input.featuresEnabled;
    }

    const [config] = await this.app.db
      .update(tenantConfigs)
      .set(updateData)
      .where(eq(tenantConfigs.tenantId, tenantId))
      .returning();

    if (!config) {
      throw Object.assign(new Error("Tenant config not found"), { statusCode: 404 });
    }

    if (input.subscriptionPlan !== undefined) {
      await this.app.db
        .update(tenants)
        .set({ planId: input.subscriptionPlan, updatedAt: new Date() })
        .where(eq(tenants.id, tenantId));
    }

    if (input.maxLearners !== undefined) {
      await this.app.db
        .update(tenants)
        .set({
          settings: sql`jsonb_set(coalesce(settings, '{}'::jsonb), '{maxLearners}', ${input.maxLearners}::text::jsonb)`,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId));
    }

    await this.auditService.log({
      adminUserId,
      action: "tenant.config.updated",
      resourceType: "tenant_config",
      resourceId: tenantId,
      details: input as Record<string, unknown>,
      ipAddress,
    });

    return config;
  }
}
