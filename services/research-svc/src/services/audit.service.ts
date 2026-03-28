import type { FastifyInstance } from "fastify";
import { adminAuditLogs } from "@aivo/db";
import { desc, eq, and, gte, lte, type SQL } from "drizzle-orm";

export interface AuditLogInput {
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditLogQuery {
  adminUserId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  constructor(private readonly app: FastifyInstance) {}

  async log(input: AuditLogInput): Promise<void> {
    await this.app.db.insert(adminAuditLogs).values({
      adminUserId: input.adminUserId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      details: input.details ?? {},
      ipAddress: input.ipAddress,
    });
  }

  async query(params: AuditLogQuery) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (params.adminUserId) {
      conditions.push(eq(adminAuditLogs.adminUserId, params.adminUserId));
    }
    if (params.action) {
      conditions.push(eq(adminAuditLogs.action, params.action));
    }
    if (params.resourceType) {
      conditions.push(eq(adminAuditLogs.resourceType, params.resourceType));
    }
    if (params.startDate) {
      conditions.push(gte(adminAuditLogs.createdAt, new Date(params.startDate)));
    }
    if (params.endDate) {
      conditions.push(lte(adminAuditLogs.createdAt, new Date(params.endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await this.app.db
      .select()
      .from(adminAuditLogs)
      .where(whereClause)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: 1,
      },
    };
  }
}
