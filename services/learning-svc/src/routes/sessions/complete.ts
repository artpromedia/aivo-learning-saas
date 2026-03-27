import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function completeSessionRoute(app: FastifyInstance) {
  app.post(
    "/learning/sessions/:id/complete",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const service = new SessionService(app);
      const session = await service.completeSession(id);
      const recommendation = service.generateNextRecommendation(session);
      return reply.send({ session, recommendation });
    },
  );
}
