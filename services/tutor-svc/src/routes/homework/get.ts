import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkService } from "../../services/homework.service.js";

export async function getHomeworkRoute(app: FastifyInstance) {
  app.get(
    "/tutors/homework/:assignmentId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { assignmentId } = request.params as { assignmentId: string };
      const svc = new HomeworkService(app);
      const assignment = await svc.getAssignment(assignmentId);
      if (!assignment) {
        return reply.status(404).send({ error: "Assignment not found" });
      }
      return { assignment };
    },
  );

  app.get(
    "/tutors/homework/learner/:learnerId",
    { preHandler: [authenticate] },
    async (request) => {
      const { learnerId } = request.params as { learnerId: string };
      const svc = new HomeworkService(app);
      const assignments = await svc.listAssignments(learnerId);
      return { assignments };
    },
  );
}
