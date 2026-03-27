import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function getSessionRoute(app: FastifyInstance) {
  app.get(
    "/learning/sessions/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const service = new SessionService(app);
      const session = await service.getSession(id);
      if (!session) {
        return reply.status(404).send({ error: "Session not found" });
      }
      return reply.send({ session });
    },
  );
}
