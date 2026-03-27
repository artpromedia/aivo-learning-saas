import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { PushService } from "../../services/push.service.js";

const registerSchema = z.object({
  type: z.enum(["fcm", "web-push"]),
  token: z.string().min(1),
  subscription: z.record(z.unknown()).optional(),
  deviceName: z.string().optional(),
});

export async function registerPushRoute(app: FastifyInstance): Promise<void> {
  app.post("/comms/push/register", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const service = new PushService(app);
    await service.registerToken(
      request.user.sub,
      body.type,
      body.token,
      body.subscription,
      body.deviceName,
    );
    return reply.status(201).send({ success: true });
  });
}
