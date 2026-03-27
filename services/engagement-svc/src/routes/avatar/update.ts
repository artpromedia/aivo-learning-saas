import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { AvatarService } from "../../services/avatar.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({
  equipped: z.record(z.string().nullable()),
});

export async function updateAvatarRoute(app: FastifyInstance) {
  app.patch("/engagement/avatar/:learnerId", { preHandler: [authenticate] }, async (request, reply) => {
    const { learnerId } = paramsSchema.parse(request.params);
    const { equipped } = bodySchema.parse(request.body);
    const service = new AvatarService(app);
    const avatar = await service.updateAvatar(learnerId, equipped);
    return reply.send(avatar);
  });
}
