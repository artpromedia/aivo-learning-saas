import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { researchExports, researchCohorts } from "@aivo/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { AuditService } from "../../services/audit.service.js";
import { PrivacyBudgetTracker } from "../../services/anonymizer.js";
import { publishEvent } from "@aivo/events";

const MAX_EXPORTS_PER_DAY = 10;

export async function createExportRoute(app: FastifyInstance) {
  app.post(
    "/research/exports",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        cohortId: string;
        format: "CSV" | "JSON" | "PARQUET";
        kLevel?: number;
        epsilon?: number;
      };

      if (!body.cohortId || !body.format) {
        return reply.status(400).send({ error: "cohortId and format are required" });
      }

      if (!["CSV", "JSON", "PARQUET"].includes(body.format)) {
        return reply.status(400).send({ error: "format must be CSV, JSON, or PARQUET" });
      }

      const kLevel = body.kLevel ?? 10;
      const epsilon = body.epsilon ?? 1.0;

      if (kLevel < 5) {
        return reply.status(400).send({ error: "kLevel must be at least 5" });
      }

      if (epsilon <= 0 || epsilon > 10) {
        return reply.status(400).send({ error: "epsilon must be between 0 and 10" });
      }

      const [cohort] = await app.db
        .select()
        .from(researchCohorts)
        .where(eq(researchCohorts.id, body.cohortId))
        .limit(1);

      if (!cohort) {
        return reply.status(404).send({ error: "Cohort not found" });
      }

      if (cohort.learnerCount < 30) {
        return reply.status(400).send({ error: "Cohort must have at least 30 learners" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayExports = await app.db
        .select({ count: sql<number>`count(*)::int` })
        .from(researchExports)
        .where(
          and(
            eq(researchExports.requestedBy, request.user.sub),
            gte(researchExports.requestedAt, today),
          ),
        );

      if ((todayExports[0]?.count ?? 0) >= MAX_EXPORTS_PER_DAY) {
        return reply.status(429).send({ error: `Maximum ${MAX_EXPORTS_PER_DAY} exports per day` });
      }

      const budgetTracker = new PrivacyBudgetTracker();
      await budgetTracker.loadFromRedis(app.redis, body.cohortId);

      if (!budgetTracker.hasRemainingBudget(body.cohortId, epsilon)) {
        return reply.status(400).send({ error: "Privacy budget exhausted for this cohort" });
      }

      const [exportRecord] = await app.db
        .insert(researchExports)
        .values({
          cohortId: body.cohortId,
          format: body.format,
          kLevel,
          epsilon,
          anonymizationMethod: "k-anonymity+laplace",
          requestedBy: request.user.sub,
          status: "PENDING",
        })
        .returning();

      budgetTracker.consume(body.cohortId, epsilon);
      await budgetTracker.saveToRedis(app.redis, body.cohortId);

      await publishEvent(app.nats, "research.export.requested", {
        exportId: exportRecord.id,
        cohortId: body.cohortId,
        format: body.format,
        kLevel,
        epsilon,
        requestedBy: request.user.sub,
      });

      const audit = new AuditService(app);
      await audit.log({
        adminUserId: request.user.sub,
        action: "research.export.requested",
        resourceType: "research_export",
        resourceId: exportRecord.id,
        details: { cohortId: body.cohortId, format: body.format, kLevel, epsilon },
        ipAddress: request.ip,
      });

      return reply.status(201).send({ export: exportRecord });
    },
  );
}
