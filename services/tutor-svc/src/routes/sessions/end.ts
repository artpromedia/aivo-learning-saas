import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

export async function endSessionRoute(app: FastifyInstance) {
  app.post(
    "/tutors/sessions/:id/end",
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      const sessionSvc = new SessionService(app);
      const result = await sessionSvc.endSession(id);
      return result;
    },
  );
}
