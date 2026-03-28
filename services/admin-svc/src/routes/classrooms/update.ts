import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { ClassroomService } from "../../services/classroom.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  gradeBand: z.string().max(64).optional(),
  teacherId: z.string().uuid().nullable().optional(),
});

export async function updateClassroomRoute(app: FastifyInstance) {
  app.patch(
    "/admin/classrooms/:id",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const body = bodySchema.parse(request.body);
      const service = new ClassroomService(app);
      const classroom = await service.update(id, request.user.tenantId, body);
      if (!classroom) {
        return reply.status(404).send({ error: "Classroom not found" });
      }
      return { classroom };
    },
  );
}
