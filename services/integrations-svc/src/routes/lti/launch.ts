import type { FastifyInstance } from "fastify";
import { ltiVerify } from "../../middleware/lti-verify.js";
import { LtiService } from "../../services/lti.service.js";

export async function ltiLaunchRoute(app: FastifyInstance) {
  app.post(
    "/integrations/lti/launch",
    { preHandler: [ltiVerify] },
    async (request, reply) => {
      const { ltiPayload } = request as typeof request & { ltiPayload: any };
      const tenantId = ltiPayload.tenantId as string;

      const service = new LtiService(app);
      const launchData = await service.handleLaunch(ltiPayload, tenantId);

      return reply.send(launchData);
    },
  );
}
