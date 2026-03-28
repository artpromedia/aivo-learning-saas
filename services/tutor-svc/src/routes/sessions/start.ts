import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";
import { SubscriptionGateService } from "../../services/subscription-gate.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  subject: z.string().min(1),
  sessionType: z.enum(["LESSON", "REVIEW", "PRACTICE"]).default("LESSON"),
  locale: z.string().min(2).max(10).default("en"),
});

export async function startSessionRoute(app: FastifyInstance) {
  app.post(
    "/tutors/sessions/start",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = bodySchema.parse(request.body);

      // Subscription gate
      const gate = new SubscriptionGateService(app);
      const access = await gate.verifyAccess(body.learnerId, body.subject);
      if (!access.allowed) {
        return reply.status(403).send({
          error: "Tutor subscription required",
          locked: true,
          requiredSku: access.requiredSku,
          message: access.message,
        });
      }

      const sessionSvc = new SessionService(app);
      const session = await sessionSvc.startSession(
        body.learnerId,
        access.sku!,
        body.subject,
        body.sessionType,
        body.locale,
      );

      return reply.status(201).send({ session });
    },
  );
}
