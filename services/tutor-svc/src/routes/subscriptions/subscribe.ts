import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ProvisioningService } from "../../services/provisioning.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  sku: z.enum([
    "ADDON_TUTOR_MATH",
    "ADDON_TUTOR_ELA",
    "ADDON_TUTOR_SCIENCE",
    "ADDON_TUTOR_HISTORY",
    "ADDON_TUTOR_CODING",
    "ADDON_TUTOR_BUNDLE",
  ]),
});

export async function subscribeRoute(app: FastifyInstance) {
  app.post(
    "/tutors/subscribe",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = bodySchema.parse(request.body);
      const tenantId = request.user.tenantId;

      const provisioning = new ProvisioningService(app);
      const result = await provisioning.provision(body.learnerId, tenantId, body.sku);

      return reply.status(201).send(result);
    },
  );
}
