import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { CollaborationService } from "../../services/collaboration.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
  userId: z.string().uuid(),
});

export async function removeMemberRoute(app: FastifyInstance) {
  app.delete(
    "/family/collaboration/:learnerId/members/:userId",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId, userId } = paramsSchema.parse(request.params);
      const service = new CollaborationService(app);
      await service.removeMember(learnerId, userId);
      return reply.send({ success: true });
    },
  );
}
