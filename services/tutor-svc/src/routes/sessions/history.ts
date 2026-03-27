import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

export async function sessionHistoryRoute(app: FastifyInstance) {
  app.get(
    "/tutors/sessions/history/:learnerId",
    { preHandler: [authenticate] },
    async (request) => {
      const { learnerId } = request.params as { learnerId: string };
      const query = request.query as { limit?: string };
      const limit = query.limit ? parseInt(query.limit, 10) : 20;

      const sessionSvc = new SessionService(app);
      const sessions = await sessionSvc.getHistory(learnerId, limit);
      return { sessions };
    },
  );
}
