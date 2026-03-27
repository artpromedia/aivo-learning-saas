import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const paramsSchema = z.object({
  learnerId: z.string().uuid(),
});

const querySchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function sessionHistoryRoute(app: FastifyInstance) {
  app.get(
    "/learning/sessions/history/:learnerId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { limit, offset } = querySchema.parse(request.query);
      const service = new SessionService(app);
      const sessions = await service.getHistory(learnerId, limit, offset);
      return reply.send({ sessions });
    },
  );
}
