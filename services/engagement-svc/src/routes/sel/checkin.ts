import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SelService } from "../../services/sel.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  emotion: z.enum(["happy", "calm", "tired", "frustrated", "sad"]),
  note: z.string().nullable().default(null),
});

export async function selCheckinRoute(app: FastifyInstance) {
  app.post("/engagement/sel/checkin", { preHandler: [authenticate] }, async (request, reply) => {
    const body = bodySchema.parse(request.body);
    const service = new SelService(app);
    const result = await service.submitCheckin(body.learnerId, body.emotion, body.note);
    return reply.status(201).send(result);
  });
}
