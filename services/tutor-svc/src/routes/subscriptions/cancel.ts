import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { DeprovisioningService } from "../../services/deprovisioning.service.js";

export async function cancelSubscriptionRoute(app: FastifyInstance) {
  app.post(
    "/tutors/subscriptions/:id/cancel",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const deprovisioning = new DeprovisioningService(app);
      const sub = await deprovisioning.startGracePeriod(id);
      return { subscription: sub };
    },
  );
}
