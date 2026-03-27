import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  responseType: z.string().min(1),
  response: z.unknown(),
  timeSpentMs: z.number().int().nonnegative(),
});

export async function interactSessionRoute(app: FastifyInstance) {
  app.post(
    "/learning/sessions/:id/interact",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const body = bodySchema.parse(request.body);
      const service = new SessionService(app);
      const session = await service.addInteraction(id, body);
      return reply.send({ session });
    },
  );
}
