import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";
import { TUTOR_CATALOG, BUNDLE_SKU } from "../../data/tutor-catalog.js";

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

      const enriched = subs
        .map((sub) => {
          const catalogEntry = TUTOR_CATALOG.find((c) => c.sku === sub.sku);
          if (!catalogEntry || sub.sku === BUNDLE_SKU) {
            return { ...sub, tutor: null };
          }
          return {
            ...sub,
            tutor: {
              name: catalogEntry.name,
              subject: catalogEntry.subject,
              persona: catalogEntry.persona,
              description: catalogEntry.description,
            },
          };
        })
        .filter((sub) => sub.tutor !== null);

      return { subscriptions: enriched };
    },
  );
}
