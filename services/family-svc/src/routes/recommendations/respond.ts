import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { RecommendationService } from "../../services/recommendation.service.js";

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({
  action: z.enum(["APPROVE", "DECLINE", "ADJUST"]),
  text: z.string().optional(),
});

export async function respondRecommendationRoute(app: FastifyInstance) {
  app.post(
    "/family/recommendations/:id/respond",
    { preHandler: [authenticate, authorize("PARENT")] },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const { action, text } = bodySchema.parse(request.body);
      const service = new RecommendationService(app);
      const result = await service.respond(id, request.user.sub, action, text);
      return reply.send(result);
    },
  );
}
