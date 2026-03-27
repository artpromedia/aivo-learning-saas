import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkSessionService } from "../../services/homework-session.service.js";

const bodySchema = z.object({ userInput: z.string().min(1) });

export async function homeworkSessionMessageRoute(app: FastifyInstance) {
  app.post(
    "/tutors/homework/sessions/:id/message",
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = bodySchema.parse(request.body);
      const svc = new HomeworkSessionService(app);
      return svc.sendMessage(id, body.userInput);
    },
  );
}
