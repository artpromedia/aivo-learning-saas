import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { CollaborationService } from "../../services/collaboration.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({
  email: z.string().email(),
  relationship: z.string().min(1),
});

export async function inviteCaregiverRoute(app: FastifyInstance) {
  app.post(
    "/family/collaboration/:learnerId/invite/caregiver",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { email, relationship } = bodySchema.parse(request.body);
      const service = new CollaborationService(app);
      const result = await service.inviteCaregiver(learnerId, request.user.sub, email, relationship);
      return reply.status(201).send(result);
    },
  );
}
