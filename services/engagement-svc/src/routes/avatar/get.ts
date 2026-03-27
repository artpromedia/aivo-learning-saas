import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { AvatarService } from "../../services/avatar.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });

export async function getAvatarRoute(app: FastifyInstance) {
  app.get("/engagement/avatar/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const service = new AvatarService(app);
    const avatar = await service.getAvatar(learnerId);
    return reply.send(avatar);
  });
}
