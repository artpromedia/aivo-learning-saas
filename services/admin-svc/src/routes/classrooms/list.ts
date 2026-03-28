import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { ClassroomService } from "../../services/classroom.service.js";

export async function listClassroomsRoute(app: FastifyInstance) {
  app.get(
    "/admin/classrooms",
    { preHandler: [authenticate, adminOnly] },
    async (request) => {
      const service = new ClassroomService(app);
      const classrooms = await service.list(request.user.tenantId);
      return { classrooms };
    },
  );
}
