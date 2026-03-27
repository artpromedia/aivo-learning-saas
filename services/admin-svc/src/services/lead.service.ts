import type { FastifyInstance } from "fastify";
import { leads, leadNotes, tenants, tenantConfigs, users } from "@aivo/db";
import { eq, desc, type SQL, and, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { publishEvent } from "@aivo/events";
import { AuditService } from "./audit.service.js";

const VALID_STAGES = [
  "NEW", "CONTACTED", "DEMO_SCHEDULED", "DEMO_COMPLETED",
  "PROPOSAL_SENT", "NEGOTIATING", "WON", "LOST",
] as const;

type LeadStage = (typeof VALID_STAGES)[number];

export interface CreateLeadInput {
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  districtSize?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateLeadInput {
  stage?: LeadStage;
  assignedTo?: string;
  organizationName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  districtSize?: number;
  metadata?: Record<string, unknown>;
}

export interface LeadListQuery {
  page?: number;
  limit?: number;
  stage?: LeadStage;
  assignedTo?: string;
}

export class LeadService {
  private auditService: AuditService;

  constructor(private readonly app: FastifyInstance) {
    this.auditService = new AuditService(app);
  }

  async list(query: LeadListQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 25, 100);
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (query.stage) {
      conditions.push(eq(leads.stage, query.stage));
    }
    if (query.assignedTo) {
      conditions.push(eq(leads.assignedTo, query.assignedTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.app.db
        .select()
        .from(leads)
        .where(whereClause)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
      this.app.db
        .select({ total: count() })
        .from(leads)
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

  async getById(leadId: string) {
    const [lead] = await this.app.db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      throw Object.assign(new Error("Lead not found"), { statusCode: 404 });
    }

    const notes = await this.app.db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.createdAt));

    return { ...lead, notes };
  }

  async create(input: CreateLeadInput, adminUserId?: string, ipAddress?: string) {
    const [lead] = await this.app.db
      .insert(leads)
      .values({
        organizationName: input.organizationName,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        districtSize: input.districtSize,
        stage: "NEW",
        source: input.source,
        metadata: input.metadata ?? {},
      })
      .returning();

    if (adminUserId) {
      await this.auditService.log({
        adminUserId,
        action: "lead.created",
        resourceType: "lead",
        resourceId: lead.id,
        details: { organizationName: input.organizationName },
        ipAddress,
      });
    }

    await publishEvent(this.app.nats, "comms.email.send", {
      templateSlug: "lead_confirmation",
      recipientEmail: input.contactEmail,
      recipientName: input.contactName,
      templateData: {
        organizationName: input.organizationName,
      },
      tags: ["lead", "confirmation"],
    });

    return lead;
  }

  async update(leadId: string, input: UpdateLeadInput, adminUserId: string, ipAddress?: string) {
    if (input.stage && !VALID_STAGES.includes(input.stage)) {
      throw Object.assign(new Error(`Invalid stage: ${input.stage}`), { statusCode: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.stage) updateData.stage = input.stage;
    if (input.assignedTo) updateData.assignedTo = input.assignedTo;
    if (input.organizationName) updateData.organizationName = input.organizationName;
    if (input.contactName) updateData.contactName = input.contactName;
    if (input.contactEmail) updateData.contactEmail = input.contactEmail;
    if (input.contactPhone !== undefined) updateData.contactPhone = input.contactPhone;
    if (input.districtSize !== undefined) updateData.districtSize = input.districtSize;
    if (input.metadata) updateData.metadata = input.metadata;

    const [lead] = await this.app.db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, leadId))
      .returning();

    if (!lead) {
      throw Object.assign(new Error("Lead not found"), { statusCode: 404 });
    }

    await this.auditService.log({
      adminUserId,
      action: "lead.updated",
      resourceType: "lead",
      resourceId: leadId,
      details: input as Record<string, unknown>,
      ipAddress,
    });

    return lead;
  }

  async addNote(leadId: string, content: string, adminUserId: string, ipAddress?: string) {
    const [lead] = await this.app.db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      throw Object.assign(new Error("Lead not found"), { statusCode: 404 });
    }

    const [note] = await this.app.db
      .insert(leadNotes)
      .values({
        leadId,
        authorId: adminUserId,
        content,
      })
      .returning();

    await this.auditService.log({
      adminUserId,
      action: "lead.note.added",
      resourceType: "lead_note",
      resourceId: leadId,
      details: { noteId: note.id },
      ipAddress,
    });

    return note;
  }

  async convert(leadId: string, adminUserId: string, ipAddress?: string) {
    const lead = await this.getById(leadId);

    if (lead.stage === "WON" && lead.convertedTenantId) {
      throw Object.assign(new Error("Lead already converted"), { statusCode: 400 });
    }

    const slug = `district-${nanoid(10)}`;

    const [tenant] = await this.app.db
      .insert(tenants)
      .values({
        name: lead.organizationName,
        slug,
        type: "B2B_DISTRICT",
        status: "ACTIVE",
      })
      .returning();

    await this.app.db.insert(tenantConfigs).values({
      tenantId: tenant.id,
      dailyLlmTokenQuota: 500000,
      features: {},
    });

    const [districtAdmin] = await this.app.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: lead.contactEmail,
        name: lead.contactName,
        role: "DISTRICT_ADMIN",
        status: "INVITED",
      })
      .returning();

    await this.app.db
      .update(leads)
      .set({
        stage: "WON",
        convertedTenantId: tenant.id,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));

    await this.auditService.log({
      adminUserId,
      action: "lead.converted",
      resourceType: "lead",
      resourceId: leadId,
      details: {
        tenantId: tenant.id,
        districtAdminId: districtAdmin.id,
        organizationName: lead.organizationName,
      },
      ipAddress,
    });

    await publishEvent(this.app.nats, "admin.tenant.created", {
      tenantId: tenant.id,
      name: lead.organizationName,
      type: "B2B_DISTRICT" as const,
      createdBy: adminUserId,
    });

    await publishEvent(this.app.nats, "comms.email.send", {
      templateSlug: "district_onboarding_invitation",
      recipientEmail: lead.contactEmail,
      recipientName: lead.contactName,
      templateData: {
        organizationName: lead.organizationName,
        tenantSlug: slug,
      },
      tags: ["onboarding", "district"],
    });

    return {
      lead: { ...lead, stage: "WON" as const, convertedTenantId: tenant.id },
      tenant,
      districtAdmin,
    };
  }

  async getStaleLeads(staleDays: number = 7) {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - staleDays);

    return this.app.sql`
      SELECT * FROM leads
      WHERE stage = 'CONTACTED'
      AND updated_at < ${staleDate.toISOString()}::timestamptz
      ORDER BY updated_at ASC
    `;
  }
}
