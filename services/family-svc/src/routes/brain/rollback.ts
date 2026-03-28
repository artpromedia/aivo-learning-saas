import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { getConfig } from "../../config.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

const bodySchema = z.object({
  snapshotId: z.string().uuid(),
});

export async function brainRollbackRoute(app: FastifyInstance) {
  app.post(
    "/family/learners/:learnerId/brain/rollback",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { snapshotId } = bodySchema.parse(request.body);
      const config = getConfig();

      const response = await fetch(
        `${config.BRAIN_SVC_URL}/versioning/brain/${learnerId}/rollback/${snapshotId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: request.headers.authorization ?? "",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        app.log.error(
          { status: response.status, body: errorText },
          "brain-svc rollback failed",
        );
        return reply.status(response.status).send({
          error: `Brain rollback failed: ${response.status}`,
          detail: errorText,
        });
      }

      const result = await response.json();

      app.log.info(
        { learnerId, snapshotId },
        "Brain rollback completed via family-svc",
      );

      return reply.send(result);
    },
  );
}
