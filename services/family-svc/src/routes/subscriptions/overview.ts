import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { learners, tenants } from "@aivo/db";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function subscriptionOverviewRoute(app: FastifyInstance) {
  app.get(
    "/family/subscriptions/:learnerId",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);

      const [learner] = await app.db
        .select()
        .from(learners)
        .where(eq(learners.id, learnerId))
        .limit(1);

      if (!learner) {
        return reply.status(404).send({ error: "Learner not found" });
      }

      const [tenant] = await app.db
        .select()
        .from(tenants)
        .where(eq(tenants.id, learner.tenantId))
        .limit(1);

      let activeTutors: string[] = [];
      try {
        const context = await app.brainClient.getContext(learnerId);
        activeTutors = context.activeTutors.map((t) => t.subject);
      } catch {
        // Brain service may not be available
      }

      return reply.send({
        plan: tenant?.planId ?? "free",
        tenantType: tenant?.type ?? "B2C_FAMILY",
        activeTutors,
        status: tenant?.status ?? "ACTIVE",
      });
    },
  );
}
