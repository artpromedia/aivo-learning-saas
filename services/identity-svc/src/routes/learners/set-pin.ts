import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { LearnerService } from "../../services/learner.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

export async function setLearnerPinRoute(app: FastifyInstance) {
  app.post(
    "/learners/:learnerId/pin",
    {
      preHandler: [
        authenticate,
        authorize("PARENT", "DISTRICT_ADMIN", "PLATFORM_ADMIN"),
        tenantContext,
      ],
    },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { pin } = bodySchema.parse(request.body);
      const learnerService = new LearnerService(app);

      // Verify the parent owns this learner
      const learner = await learnerService.getById(learnerId, request.tenantId);
      if (learner.parentId !== request.user.sub) {
        return reply.status(403).send({ error: "Only the parent can set the learner PIN" });
      }

      const result = await learnerService.setPin(learnerId, request.tenantId, pin);
      return reply.status(200).send(result);
    },
  );
}
