import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

export async function getSessionRoute(app: FastifyInstance) {
  app.get(
    "/tutors/sessions/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const sessionSvc = new SessionService(app);
      const session = await sessionSvc.getSession(id);
      if (!session) {
        return reply.status(404).send({ error: "Session not found" });
      }
      return { session };
    },
  );
}
