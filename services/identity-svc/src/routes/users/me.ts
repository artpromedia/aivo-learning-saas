import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { UserService } from "../../services/user.service.js";

export async function meRoute(app: FastifyInstance) {
  app.get("/users/me", { preHandler: [authenticate] }, async (request, reply) => {
    const userService = new UserService(app);
    const user = await userService.getById(request.user.sub);

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
      },
    });
  });
}
