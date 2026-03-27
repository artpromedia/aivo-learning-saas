import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { GradebookService } from "../../services/gradebook.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
});

export async function gradebookSummaryRoute(app: FastifyInstance) {
  app.get(
    "/learning/gradebook/:learnerId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const service = new GradebookService(app);
      const summary = await service.getSummary(learnerId);
      return reply.send(summary);
    },
  );
}
