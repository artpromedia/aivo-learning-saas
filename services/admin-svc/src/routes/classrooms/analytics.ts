import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { ClassroomService } from "../../services/classroom.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function classroomAnalyticsRoute(app: FastifyInstance) {
  app.get(
    "/admin/classrooms/:id/analytics",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const service = new ClassroomService(app);

      const classroom = await service.getById(id, request.user.tenantId);
      if (!classroom) {
        return reply.status(404).send({ error: "Classroom not found" });
      }

      const analytics = await service.getClassroomAnalytics(id);
      return { classroom, analytics };
    },
  );
}
