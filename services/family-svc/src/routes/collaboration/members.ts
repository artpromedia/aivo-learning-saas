import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { CollaborationService } from "../../services/collaboration.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function collaborationMembersRoute(app: FastifyInstance) {
  app.get(
    "/family/collaboration/:learnerId/members",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new CollaborationService(app);
      const members = await service.getMembers(learnerId);
      return reply.send({ members });
    },
  );
}
