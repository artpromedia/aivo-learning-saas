import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { ClassroomService } from "../../services/classroom.service.js";

const bodySchema = z.object({
  name: z.string().min(1).max(255),
  gradeBand: z.string().max(64).optional(),
  teacherId: z.string().uuid().optional(),
});

export async function createClassroomRoute(app: FastifyInstance) {
  app.post(
    "/admin/classrooms",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = bodySchema.parse(request.body);
      const service = new ClassroomService(app);
      const classroom = await service.create(
        request.user.tenantId,
        body,
        request.user.sub,
      );
      return reply.status(201).send({ classroom });
    },
  );
}
