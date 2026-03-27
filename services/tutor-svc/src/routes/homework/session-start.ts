import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { HomeworkSessionService } from "../../services/homework-session.service.js";
import { SubscriptionGateService } from "../../services/subscription-gate.service.js";
import { HomeworkUploadService } from "../../services/homework-upload.service.js";

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

      // Verify assignment exists and get subject
      const uploadSvc = new HomeworkUploadService(app);
      const assignment = await uploadSvc.getAssignment(assignmentId);
      if (!assignment) {
        return reply.status(404).send({ error: "Assignment not found" });
      }

      // Subscription gate for homework subject
      const gate = new SubscriptionGateService(app);
      const access = await gate.verifyAccess(learnerId, assignment.subject);
      if (!access.allowed) {
        return reply.status(403).send({
          error: "Tutor subscription required for homework help",
          locked: true,
          requiredSku: access.requiredSku,
          message: access.message,
        });
      }

      const sessionSvc = new HomeworkSessionService(app);
      const session = await sessionSvc.startSession(assignmentId, learnerId);
      return reply.status(201).send({ session });
    },
  );
}
