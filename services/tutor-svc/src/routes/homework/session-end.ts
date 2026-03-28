import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkService } from "../../services/homework.service.js";

export async function homeworkSessionEndRoute(app: FastifyInstance) {
  app.post(
    "/tutors/homework/sessions/:id/end",
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      const svc = new HomeworkService(app);
      return svc.endSession(id);
    },
  );
}
