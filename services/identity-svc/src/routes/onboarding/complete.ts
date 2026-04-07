import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";

export async function onboardingCompleteRoute(app: FastifyInstance) {
  app.post(
    "/onboarding/complete",
    { preHandler: [authenticate] },
    async (_request, reply) => {
      return reply.send({ completed: true });
    },
  );
}
