import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkUploadService } from "../../services/homework-upload.service.js";

export async function getHomeworkRoute(app: FastifyInstance) {
  app.get(
    "/tutors/homework/:assignmentId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { assignmentId } = request.params as { assignmentId: string };
      const svc = new HomeworkUploadService(app);
      const assignment = await svc.getAssignment(assignmentId);
      if (!assignment) {
        return reply.status(404).send({ error: "Assignment not found" });
      }
      return { assignment };
    },
  );
}
