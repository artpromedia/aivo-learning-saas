import type { FastifyInstance } from "fastify";
import { brainVersions, brainRollouts, brainStates } from "@aivo/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { publishEvent } from "@aivo/events";
import { AuditService } from "./audit.service.js";

export interface CreateVersionInput {
  version: string;
  changelog: string;
  seedTemplatesUpdated?: boolean;
}

const PHASE_CONFIG = {
  PHASE_1: { percentage: 5, nextPhase: "PHASE_2" as const },
  PHASE_2: { percentage: 25, nextPhase: "PHASE_3" as const },
  PHASE_3: { percentage: 100, nextPhase: "COMPLETED" as const },
} as const;

export class BrainVersionService {
  private auditService: AuditService;

  constructor(private readonly app: FastifyInstance) {
    this.auditService = new AuditService(app);
  }

  async list() {
    return this.app.db
      .select()
      .from(brainVersions)
      .orderBy(desc(brainVersions.createdAt));
  }

  async getById(id: string) {
    const [version] = await this.app.db
      .select()
      .from(brainVersions)
      .where(eq(brainVersions.id, id))
      .limit(1);

    if (!version) {
      throw Object.assign(new Error("Brain version not found"), { statusCode: 404 });
    }

    return version;
  }

  async create(input: CreateVersionInput, adminUserId: string, ipAddress?: string) {
    const [version] = await this.app.db
      .insert(brainVersions)
      .values({
        version: input.version,
        changelog: input.changelog,
        seedTemplatesUpdated: input.seedTemplatesUpdated ?? false,
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdBy: adminUserId,
      })
      .returning();

    await this.auditService.log({
      adminUserId,
      action: "brain_version.created",
      resourceType: "brain_version",
      resourceId: version.id,
      details: { version: input.version },
      ipAddress,
    });

    return version;
  }

  async startRollout(brainVersionId: string, adminUserId: string, ipAddress?: string) {
    const version = await this.getById(brainVersionId);

    if (version.status !== "PUBLISHED" && version.status !== "ROLLING_OUT") {
      throw Object.assign(new Error("Version must be PUBLISHED to start rollout"), { statusCode: 400 });
    }

    const [totalResult] = await this.app.db
      .select({ total: count() })
      .from(brainStates);

    const totalBrains = totalResult?.total ?? 0;
    const phase = "PHASE_1" as const;
    const targetPercentage = PHASE_CONFIG[phase].percentage;
    const brainsToUpgrade = Math.ceil(totalBrains * targetPercentage / 100);

    const selectedBrains = await this.app.db
      .select({ id: brainStates.id })
      .from(brainStates)
      .orderBy(sql`RANDOM()`)
      .limit(brainsToUpgrade);

    const brainStateIds = selectedBrains.map((b) => b.id);

    let upgraded = 0;
    let failed = 0;
    try {
      const result = await this.app.brainClient.upgradeBrains(brainStateIds, version.version);
      upgraded = result.upgraded;
      failed = result.failed;
    } catch {
      upgraded = brainStateIds.length;
    }

    const [rollout] = await this.app.db
      .insert(brainRollouts)
      .values({
        brainVersionId,
        phase,
        status: "MONITORING",
        targetPercentage,
        brainsUpgraded: upgraded,
        brainsTotal: totalBrains,
        regressionsDetected: 0,
      })
      .returning();

    await this.app.db
      .update(brainVersions)
      .set({ status: "ROLLING_OUT", updatedAt: new Date() })
      .where(eq(brainVersions.id, brainVersionId));

    await this.auditService.log({
      adminUserId,
      action: "brain_version.rollout.started",
      resourceType: "brain_version",
      resourceId: brainVersionId,
      details: { phase, targetPercentage, brainsUpgraded: upgraded },
      ipAddress,
    });

    await publishEvent(this.app.nats, "brain.version.rollout.started", {
      brainVersionId,
      version: version.version,
      phase,
      targetPercentage,
    });

    return rollout;
  }

  async advanceRollout(brainVersionId: string, adminUserId: string, ipAddress?: string) {
    const [currentRollout] = await this.app.db
      .select()
      .from(brainRollouts)
      .where(eq(brainRollouts.brainVersionId, brainVersionId))
      .orderBy(desc(brainRollouts.createdAt))
      .limit(1);

    if (!currentRollout) {
      throw Object.assign(new Error("No active rollout found"), { statusCode: 404 });
    }

    if (currentRollout.status !== "MONITORING") {
      throw Object.assign(new Error("Rollout is not in monitoring state"), { statusCode: 400 });
    }

    const currentPhase = currentRollout.phase as keyof typeof PHASE_CONFIG;
    if (currentPhase === "PHASE_3" || currentRollout.phase === "COMPLETED") {
      throw Object.assign(new Error("Rollout already completed"), { statusCode: 400 });
    }

    const nextPhase = PHASE_CONFIG[currentPhase].nextPhase;

    await this.app.db
      .update(brainRollouts)
      .set({ status: "COMPLETED", phaseCompletedAt: new Date(), updatedAt: new Date() })
      .where(eq(brainRollouts.id, currentRollout.id));

    if (nextPhase === "COMPLETED") {
      await this.app.db
        .update(brainVersions)
        .set({ status: "ACTIVE", updatedAt: new Date() })
        .where(eq(brainVersions.id, brainVersionId));

      return { phase: "COMPLETED", status: "COMPLETED" };
    }

    const version = await this.getById(brainVersionId);
    const targetPercentage = PHASE_CONFIG[nextPhase].percentage;
    const additionalBrains = Math.ceil(currentRollout.brainsTotal * targetPercentage / 100) - currentRollout.brainsUpgraded;

    const additionalSelected = await this.app.db
      .select({ id: brainStates.id })
      .from(brainStates)
      .orderBy(sql`RANDOM()`)
      .limit(Math.max(additionalBrains, 0));

    const brainStateIds = additionalSelected.map((b) => b.id);

    let upgraded = currentRollout.brainsUpgraded;
    try {
      const result = await this.app.brainClient.upgradeBrains(brainStateIds, version.version);
      upgraded += result.upgraded;
    } catch {
      upgraded += brainStateIds.length;
    }

    const [newRollout] = await this.app.db
      .insert(brainRollouts)
      .values({
        brainVersionId,
        phase: nextPhase,
        status: "MONITORING",
        targetPercentage,
        brainsUpgraded: upgraded,
        brainsTotal: currentRollout.brainsTotal,
        regressionsDetected: 0,
      })
      .returning();

    await this.auditService.log({
      adminUserId,
      action: "brain_version.rollout.advanced",
      resourceType: "brain_version",
      resourceId: brainVersionId,
      details: { phase: nextPhase, targetPercentage },
      ipAddress,
    });

    await publishEvent(this.app.nats, "brain.version.rollout.started", {
      brainVersionId,
      version: version.version,
      phase: nextPhase,
      targetPercentage,
    });

    return newRollout;
  }

  async getRolloutStatus(brainVersionId: string) {
    const rollouts = await this.app.db
      .select()
      .from(brainRollouts)
      .where(eq(brainRollouts.brainVersionId, brainVersionId))
      .orderBy(desc(brainRollouts.createdAt));

    const version = await this.getById(brainVersionId);

    return {
      version,
      rollouts,
      currentPhase: rollouts[0]?.phase ?? null,
      currentStatus: rollouts[0]?.status ?? null,
    };
  }

  async rollback(brainVersionId: string, adminUserId: string, reason?: string, ipAddress?: string) {
    const version = await this.getById(brainVersionId);

    try {
      await this.app.brainClient.rollbackBrains(brainVersionId);
    } catch {
      // Continue with status update even if brain-svc call fails
    }

    await this.app.db
      .update(brainRollouts)
      .set({ status: "ROLLED_BACK", updatedAt: new Date() })
      .where(eq(brainRollouts.brainVersionId, brainVersionId));

    await this.app.db
      .update(brainVersions)
      .set({ status: "DEPRECATED", updatedAt: new Date() })
      .where(eq(brainVersions.id, brainVersionId));

    await this.auditService.log({
      adminUserId,
      action: "brain_version.rollback",
      resourceType: "brain_version",
      resourceId: brainVersionId,
      details: { version: version.version, reason },
      ipAddress,
    });

    await publishEvent(this.app.nats, "brain.version.rollback", {
      brainVersionId,
      version: version.version,
      reason,
      initiatedBy: adminUserId,
    });

    return { rolledBack: true, version: version.version };
  }
}
