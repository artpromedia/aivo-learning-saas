import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { LtiService } from "../../services/lti.service.js";

export async function ltiAgsRoute(app: FastifyInstance) {
  app.post(
    "/integrations/lti/ags/grades",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN", "TEACHER")] },
    async (request, reply) => {
      const { tenantId, lineItemUrl, scoreGiven, scoreMaximum, userId } =
        request.body as {
          tenantId: string;
          lineItemUrl: string;
          scoreGiven: number;
          scoreMaximum: number;
          userId: string;
        };

      const service = new LtiService(app);
      await service.postGrade(tenantId, lineItemUrl, {
        scoreGiven,
        scoreMaximum,
        userId,
        activityProgress: "Completed",
        gradingProgress: "FullyGraded",
      });

      return reply.send({ success: true });
    },
  );
}
