import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { tenants } from "@aivo/db";

export interface UpdateTenantInput {
  name?: string;
  settings?: Record<string, unknown>;
}

export class TenantService {
  constructor(private readonly app: FastifyInstance) {}

  async getById(tenantId: string, requestingTenantId: string) {
    if (tenantId !== requestingTenantId) {
      throw Object.assign(new Error("Access denied"), { statusCode: 403 });
    }

    const [tenant] = await this.app.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw Object.assign(new Error("Tenant not found"), { statusCode: 404 });
    }

    return tenant;
  }

  async update(tenantId: string, requestingTenantId: string, input: UpdateTenantInput) {
    if (tenantId !== requestingTenantId) {
      throw Object.assign(new Error("Access denied"), { statusCode: 403 });
    }

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

    return tenant;
  }
}
