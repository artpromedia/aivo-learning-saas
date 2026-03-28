import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { ClassroomService } from "../../services/classroom.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function deleteClassroomRoute(app: FastifyInstance) {
  app.delete(
    "/admin/classrooms/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const service = new ClassroomService(app);
      const classroom = await service.softDelete(id, request.user.tenantId);
      if (!classroom) {
        return reply.status(404).send({ error: "Classroom not found" });
      }
      return { success: true };
    },
  );
}
