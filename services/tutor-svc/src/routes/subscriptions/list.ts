import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";

export async function listSubscriptionsRoute(app: FastifyInstance) {
  app.get(
    "/tutors/subscriptions",
    { preHandler: [authenticate] },
    async (request) => {
      const { learnerId } = z
        .object({ learnerId: z.string().uuid() })
        .parse(request.query);
      const svc = new SubscriptionService(app);
      const subs = await svc.getActiveSubscriptions(learnerId);
      return { subscriptions: subs };
    },
  );
}
