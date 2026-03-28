import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { interventionStudies, researchCohorts } from "@aivo/db";
import { eq } from "drizzle-orm";
import { AuditService } from "../../services/audit.service.js";
import { publishEvent } from "@aivo/events";

export async function createStudyRoute(app: FastifyInstance) {
  app.post(
    "/research/studies",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        description?: string;
        hypothesis?: string;
        controlCohortId: string;
        treatmentCohortId: string;
        metric: string;
        startDate: string;
        endDate?: string;
      };

      if (!body.name || !body.controlCohortId || !body.treatmentCohortId || !body.metric || !body.startDate) {
        return reply.status(400).send({
          error: "name, controlCohortId, treatmentCohortId, metric, and startDate are required",
        });
      }

      if (body.controlCohortId === body.treatmentCohortId) {
        return reply.status(400).send({ error: "Control and treatment cohorts must be different" });
      }

      const [controlCohort] = await app.db
        .select()
        .from(researchCohorts)
        .where(eq(researchCohorts.id, body.controlCohortId))
        .limit(1);

      const [treatmentCohort] = await app.db
        .select()
        .from(researchCohorts)
        .where(eq(researchCohorts.id, body.treatmentCohortId))
        .limit(1);

      if (!controlCohort) {
        return reply.status(404).send({ error: "Control cohort not found" });
      }

      if (!treatmentCohort) {
        return reply.status(404).send({ error: "Treatment cohort not found" });
      }

      if (controlCohort.learnerCount < 30) {
        return reply.status(400).send({ error: "Control cohort must have at least 30 learners" });
      }

      if (treatmentCohort.learnerCount < 30) {
        return reply.status(400).send({ error: "Treatment cohort must have at least 30 learners" });
      }

      const [study] = await app.db
        .insert(interventionStudies)
        .values({
          name: body.name,
          description: body.description ?? null,
          hypothesis: body.hypothesis ?? null,
          controlCohortId: body.controlCohortId,
          treatmentCohortId: body.treatmentCohortId,
          metric: body.metric,
          startDate: body.startDate,
          endDate: body.endDate ?? null,
          status: "DRAFT",
          createdBy: request.user.sub,
        })
        .returning();

      await publishEvent(app.nats, "research.study.created", {
        studyId: study.id,
        name: body.name,
        controlCohortId: body.controlCohortId,
        treatmentCohortId: body.treatmentCohortId,
        metric: body.metric,
      });

      const audit = new AuditService(app);
      await audit.log({
        adminUserId: request.user.sub,
        action: "research.study.created",
        resourceType: "intervention_study",
        resourceId: study.id,
        details: { name: body.name, metric: body.metric },
        ipAddress: request.ip,
      });

      return reply.status(201).send({ study });
    },
  );
}
