import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { UserService } from "../../services/user.service.js";

export async function deleteAccountRoute(app: FastifyInstance) {
  app.delete("/users/me", { preHandler: [authenticate] }, async (request, reply) => {
    const userService = new UserService(app);
    await userService.deleteAccount(request.user.sub);

    reply
      .clearCookie("access_token", { path: "/" })
      .clearCookie("refresh_token", { path: "/auth/refresh" });

    return reply.status(200).send({ deleted: true });
  });
}
