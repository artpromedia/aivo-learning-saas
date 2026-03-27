import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  subject: z.string().min(1),
  sessionType: z.enum(["LESSON", "QUIZ", "READING", "WRITING"]).default("LESSON"),
  skillTargets: z.array(z.string()).optional(),
});

export async function startSessionRoute(app: FastifyInstance) {
  app.post(
    "/learning/sessions/start",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = bodySchema.parse(request.body);
      const service = new SessionService(app);
      const session = await service.startSession(body);
      return reply.status(201).send({ session });
    },
  );
}
