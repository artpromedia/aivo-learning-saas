import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { PushService } from "../../services/push.service.js";

const unregisterSchema = z.object({
  token: z.string().min(1),
});

export async function unregisterPushRoute(app: FastifyInstance): Promise<void> {
  app.post("/comms/push/unregister", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = unregisterSchema.parse(request.body);
    const service = new PushService(app);
    await service.unregisterToken(body.token);
    return reply.send({ success: true });
  });
}
