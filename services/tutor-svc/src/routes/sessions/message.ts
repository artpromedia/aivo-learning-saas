import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const bodySchema = z.object({
  userInput: z.string().min(1),
  locale: z.string().min(2).max(10).optional(),
});

export async function messageSessionRoute(app: FastifyInstance) {
  app.post(
    "/tutors/sessions/:id/message",
    { preHandler: [authenticate] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = bodySchema.parse(request.body);
      const sessionSvc = new SessionService(app);
      const response = await sessionSvc.sendMessage(id, body.userInput, body.locale);
      return response;
    },
  );
}
