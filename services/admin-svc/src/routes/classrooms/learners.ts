import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { ClassroomService } from "../../services/classroom.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });
const addLearnersBody = z.object({
  learnerIds: z.array(z.string().uuid()).min(1),
});
const removeLearnerParams = z.object({
  id: z.string().uuid(),
  learnerId: z.string().uuid(),
});

export async function classroomLearnersRoute(app: FastifyInstance) {
  // Add learners to classroom (bulk)
  app.post(
    "/admin/classrooms/:id/learners",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const { learnerIds } = addLearnersBody.parse(request.body);
      const service = new ClassroomService(app);

      // Verify classroom exists in tenant
      const classroom = await service.getById(id, request.user.tenantId);
      if (!classroom) {
        return reply.status(404).send({ error: "Classroom not found" });
      }

      const added = await service.addLearners(id, learnerIds);
      return reply.status(201).send({
        added: added.length,
        classroomId: id,
      });
    },
  );

  // Remove learner from classroom
  app.delete(
    "/admin/classrooms/:id/learners/:learnerId",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id, learnerId } = removeLearnerParams.parse(request.params);
      const service = new ClassroomService(app);

      const classroom = await service.getById(id, request.user.tenantId);
      if (!classroom) {
        return reply.status(404).send({ error: "Classroom not found" });
      }

      const removed = await service.removeLearner(id, learnerId);
      if (!removed) {
        return reply.status(404).send({ error: "Learner not in classroom" });
      }

      return { success: true };
    },
  );

  // Get classroom learners
  app.get(
    "/admin/classrooms/:id/learners",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const service = new ClassroomService(app);

      const classroom = await service.getById(id, request.user.tenantId);
      if (!classroom) {
        return reply.status(404).send({ error: "Classroom not found" });
      }

      const learners = await service.getClassroomLearners(id);
      return { learners };
    },
  );
}
