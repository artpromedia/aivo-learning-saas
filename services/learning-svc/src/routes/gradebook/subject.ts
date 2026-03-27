import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { GradebookService } from "../../services/gradebook.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
  subject: z.string().min(1),
});

export async function gradebookSubjectRoute(app: FastifyInstance) {
  app.get(
    "/learning/gradebook/:learnerId/:subject",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId, subject } = paramsSchema.parse(request.params);
      const service = new GradebookService(app);
      const detail = await service.getSubjectDetail(learnerId, subject);
      return reply.send(detail);
    },
  );
}
