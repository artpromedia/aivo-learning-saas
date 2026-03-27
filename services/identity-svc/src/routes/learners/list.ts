import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { LearnerService } from "../../services/learner.service.js";

export async function listLearnersRoute(app: FastifyInstance) {
  app.get(
    "/learners",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const learnerService = new LearnerService(app);
      const learnerList = await learnerService.listByParent(request.user.sub, request.tenantId);

      return reply.status(200).send({ learners: learnerList });
    },
  );
}
