import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkService } from "../../services/homework.service.js";

export async function homeworkSessionStartRoute(app: FastifyInstance) {
  app.post(
    "/tutors/homework/:assignmentId/session",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { assignmentId } = request.params as { assignmentId: string };
      const { learnerId } = (request.body as { learnerId?: string }) ?? {};

      if (!learnerId) {
        return reply.status(400).send({ error: "learnerId is required" });
      }

      const svc = new HomeworkService(app);

      try {
        const result = await svc.startSession(assignmentId, learnerId);
        return reply.status(201).send({
          session: result.session,
          firstPrompt: result.firstPrompt,
        });
      } catch (err) {
        const error = err as { statusCode?: number; locked?: boolean; requiredSku?: string; message?: string };
        if (error.statusCode === 403) {
          return reply.status(403).send({
            error: "Tutor subscription required for homework help",
            locked: error.locked ?? true,
            requiredSku: error.requiredSku,
            message: error.message,
          });
        }
        throw err;
      }
    },
  );
}
