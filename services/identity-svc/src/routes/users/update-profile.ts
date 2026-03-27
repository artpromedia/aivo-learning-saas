import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { UserService } from "../../services/user.service.js";

const updateProfileBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
});

export async function updateProfileRoute(app: FastifyInstance) {
  app.patch("/users/me", { preHandler: [authenticate] }, async (request, reply) => {
    const body = updateProfileBodySchema.parse(request.body);
    const userService = new UserService(app);
    const user = await userService.updateProfile(request.user.sub, body);

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
      },
    });
  });
}
