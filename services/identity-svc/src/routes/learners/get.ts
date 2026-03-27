import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { LearnerService } from "../../services/learner.service.js";

export async function getLearnerRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    "/learners/:id",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const learnerService = new LearnerService(app);
      const learner = await learnerService.getById(request.params.id, request.tenantId);

      return reply.status(200).send({ learner });
    },
  );
}
