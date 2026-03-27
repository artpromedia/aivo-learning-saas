import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { LearnerService } from "../../services/learner.service.js";

const createLearnerBodySchema = z.object({
  name: z.string().min(1).max(255),
  dateOfBirth: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
  enrolledGrade: z.number().int().min(0).max(12).optional(),
  schoolName: z.string().max(255).optional(),
  functioningLevel: z
    .enum(["STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"])
    .optional(),
  communicationMode: z
    .enum(["VERBAL", "LIMITED_VERBAL", "NON_VERBAL_AAC", "NON_VERBAL_PARTNER", "PRE_INTENTIONAL"])
    .optional(),
});

export async function createLearnerRoute(app: FastifyInstance) {
  app.post(
    "/learners",
    { preHandler: [authenticate, authorize("PARENT", "DISTRICT_ADMIN", "PLATFORM_ADMIN"), tenantContext] },
    async (request, reply) => {
      const body = createLearnerBodySchema.parse(request.body);
      const learnerService = new LearnerService(app);

      const learner = await learnerService.create(request.user.sub, request.tenantId, body);

      return reply.status(201).send({ learner });
    },
  );
}
