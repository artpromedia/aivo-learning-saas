import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkSessionService } from "../../services/homework-session.service.js";

export async function homeworkSessionEndRoute(app: FastifyInstance) {
  app.post(
    "/tutors/homework/sessions/:id/end",
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      const svc = new HomeworkSessionService(app);
      return svc.endSession(id);
    },
  );
}
