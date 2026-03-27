import type { FastifyInstance } from "fastify";
import { ltiVerify } from "../../middleware/lti-verify.js";
import { LtiService } from "../../services/lti.service.js";

export async function ltiDeepLinkRoute(app: FastifyInstance) {
  app.post(
    "/integrations/lti/deep-link",
    { preHandler: [ltiVerify] },
    async (request, reply) => {
      const { ltiPayload } = request as typeof request & { ltiPayload: any };
      const { items } = request.body as { items: any[] };

      const service = new LtiService(app);
      const jwt = await service.handleDeepLink(ltiPayload, items);

      return reply.send({ jwt });
    },
  );
}
